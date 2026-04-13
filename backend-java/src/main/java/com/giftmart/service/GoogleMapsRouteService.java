package com.giftmart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.giftmart.dto.ReversedAddress;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Objects;

/**
 * Driving distance from Jaffna (hub) using Google Distance Matrix; Haversine fallback when needed.
 */
@Service
public class GoogleMapsRouteService {

    private static final Logger log = LoggerFactory.getLogger(GoogleMapsRouteService.class);

    @Value("${giftmart.origin.lat:9.6615}")
    private double originLat;

    @Value("${giftmart.origin.lng:80.0255}")
    private double originLng;

    @Value("${google.maps.api.key:}")
    private String googleApiKey;

    /**
     * When Google Distance Matrix fails (network, billing, quota) and this is &gt; 0, use this distance (km) for shipping tiers
     * instead of straight-line Haversine. When 0, keep Haversine fallback (current default).
     */
    @Value("${giftmart.shipping.distance-matrix-fallback-km:0}")
    private double distanceMatrixFallbackKm;

    /**
     * When Distance Matrix fails and this is &gt; 0, charge this flat shipping (LKR) and ignore distance tiers.
     * Takes precedence over {@link #distanceMatrixFallbackKm} when both are set.
     */
    @Value("${giftmart.shipping.matrix-failure-flat-lkr:0}")
    private double matrixFailureFlatLkr;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GoogleMapsRouteService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public double getOriginLat() {
        return originLat;
    }

    public double getOriginLng() {
        return originLng;
    }

    public ResolvedDelivery resolveDelivery(Map<String, Object> body) {
        Double destLat = readDouble(body, "deliveryLat");
        Double destLng = readDouble(body, "deliveryLng");
        if (destLat != null && destLng != null && validCoord(destLat, destLng)) {
            DistanceSolve ds = distanceKmSolve(destLat, destLng);
            return new ResolvedDelivery(ds.km(), destLat, destLng, ds.shippingOverrideLkr(), ds.routeFallback());
        }
        OrderShippingParser.ParsedAddress addr = OrderShippingParser.parse(body);
        if (addr == null || !addr.hasMinimumFields()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Provide delivery location: use live location / map pin (lat & lng) or street, city, district, and province.");
        }
        if (googleApiKey == null || googleApiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Google Maps API key is not configured (google.maps.api.key). Add it to geocode manual addresses, or use map / live location.");
        }
        String geocodeQuery = addr.geocodeQuery();
        double[] ll = geocode(geocodeQuery);
        DistanceSolve ds = distanceKmSolve(ll[0], ll[1]);
        return new ResolvedDelivery(ds.km(), ll[0], ll[1], ds.shippingOverrideLkr(), ds.routeFallback());
    }

    /** Result of resolving road distance vs fallbacks (Haversine, fixed km, or flat LKR shipping). */
    private record DistanceSolve(double km, Double shippingOverrideLkr, boolean routeFallback) {
    }

    /**
     * Prefer Google Distance Matrix; on failure use configured flat fee, fixed km tier, or Haversine.
     */
    private DistanceSolve distanceKmSolve(double destLat, double destLng) {
        boolean hasKey = googleApiKey != null && !googleApiKey.isBlank();
        if (hasKey) {
            Double driving = drivingDistanceKm(originLat, originLng, destLat, destLng);
            if (driving != null && driving >= 0) {
                return new DistanceSolve(driving, null, false);
            }
            log.warn("Distance Matrix unavailable or returned no route; applying shipping fallback (Haversine / fixed km / flat LKR).");
            double haversine = haversineKm(originLat, originLng, destLat, destLng);
            if (matrixFailureFlatLkr > 0) {
                return new DistanceSolve(haversine, matrixFailureFlatLkr, true);
            }
            if (distanceMatrixFallbackKm > 0) {
                return new DistanceSolve(distanceMatrixFallbackKm, null, true);
            }
            return new DistanceSolve(haversine, null, true);
        }
        return new DistanceSolve(haversineKm(originLat, originLng, destLat, destLng), null, false);
    }

    private Double drivingDistanceKm(double oLat, double oLng, double dLat, double dLng) {
        try {
            String key = URLEncoder.encode(googleApiKey, StandardCharsets.UTF_8);
            String url = Objects.requireNonNull(String.format(
                    "https://maps.googleapis.com/maps/api/distancematrix/json?origins=%f,%f&destinations=%f,%f&units=metric&key=%s",
                    oLat, oLng, dLat, dLng, key));
            String json = restTemplate.getForObject(url, String.class);
            if (json == null) {
                return null;
            }
            JsonNode root = objectMapper.readTree(json);
            if (!"OK".equals(root.path("status").asText())) {
                return null;
            }
            JsonNode el = root.path("rows").path(0).path("elements").path(0);
            if (!"OK".equals(el.path("status").asText())) {
                return null;
            }
            int meters = el.path("distance").path("value").asInt(-1);
            if (meters < 0) {
                return null;
            }
            return meters / 1000.0;
        } catch (Exception e) {
            return null;
        }
    }

    private double[] geocode(String address) {
        try {
            String enc = URLEncoder.encode(address, StandardCharsets.UTF_8);
            String key = URLEncoder.encode(googleApiKey, StandardCharsets.UTF_8);
            String url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + enc + "&key=" + key;
            String json = restTemplate.getForObject(url, String.class);
            if (json == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Geocoding failed");
            }
            JsonNode root = objectMapper.readTree(json);
            if (!"OK".equals(root.path("status").asText())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Could not find that address on the map. Check street, city, district, and province.");
            }
            JsonNode loc = root.path("results").path(0).path("geometry").path("location");
            return new double[] { loc.path("lat").asDouble(), loc.path("lng").asDouble() };
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Geocoding error: " + e.getMessage());
        }
    }

    private static boolean validCoord(double lat, double lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }

    private static Double readDouble(Map<String, Object> body, String key) {
        if (body == null || body.get(key) == null) {
            return null;
        }
        Object v = body.get(key);
        if (v instanceof Number n) {
            return n.doubleValue();
        }
        try {
            return Double.parseDouble(v.toString().trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Fill address fields from GPS coordinates: Google Geocoding first, then OpenStreetMap Nominatim (no API key).
     */
    public ReversedAddress reverseGeocode(double lat, double lng) {
        if (!validCoord(lat, lng)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid coordinates");
        }
        if (googleApiKey != null && !googleApiKey.isBlank()) {
            try {
                ReversedAddress g = reverseGeocodeGoogle(lat, lng);
                if (g != null && (!g.getCity().isBlank() || !g.getState().isBlank())) {
                    return g;
                }
            } catch (Exception ignored) {
                // fall through to Nominatim
            }
        }
        ReversedAddress n = reverseGeocodeNominatim(lat, lng);
        if (n != null && (!n.getCity().isBlank() || !n.getState().isBlank())) {
            return n;
        }
        ReversedAddress fallback = new ReversedAddress();
        fallback.setCountry("Sri Lanka");
        fallback.setFormattedAddress(String.format("%.5f, %.5f", lat, lng));
        return fallback;
    }

    private ReversedAddress reverseGeocodeGoogle(double lat, double lng) throws Exception {
        String key = URLEncoder.encode(googleApiKey, StandardCharsets.UTF_8);
        String url = Objects.requireNonNull(String.format(
                "https://maps.googleapis.com/maps/api/geocode/json?latlng=%f,%f&key=%s",
                lat, lng, key));
        String json = restTemplate.getForObject(url, String.class);
        if (json == null) {
            return null;
        }
        JsonNode root = objectMapper.readTree(json);
        if (!"OK".equals(root.path("status").asText()) || root.path("results").isEmpty()) {
            return null;
        }
        JsonNode result = root.path("results").path(0);
        ReversedAddress a = new ReversedAddress();
        a.setFormattedAddress(result.path("formatted_address").asText(""));
        String streetNum = "";
        String route = "";
        String locality = "";
        String adm2 = "";
        String adm1 = "";
        String country = "";
        String postal = "";
        String subloc = "";
        for (JsonNode comp : result.path("address_components")) {
            String longName = comp.path("long_name").asText("");
            for (JsonNode t : comp.path("types")) {
                String type = t.asText();
                switch (type) {
                    case "street_number" -> streetNum = longName;
                    case "route" -> route = longName;
                    case "locality" -> locality = longName;
                    case "administrative_area_level_2" -> adm2 = longName;
                    case "administrative_area_level_1" -> adm1 = longName;
                    case "country" -> country = longName;
                    case "postal_code" -> postal = longName;
                    case "sublocality", "sublocality_level_1" -> {
                        if (subloc.isBlank()) {
                            subloc = longName;
                        }
                    }
                    default -> {
                    }
                }
            }
        }
        a.setStreet((streetNum + " " + route).trim());
        if (locality.isBlank()) {
            locality = subloc;
        }
        a.setCity(locality);
        if (adm2.isBlank()) {
            a.setDistrict(locality.isBlank() ? subloc : locality);
        } else {
            a.setDistrict(adm2);
        }
        a.setState(adm1);
        a.setZip(postal);
        a.setCountry(country.isBlank() ? "Sri Lanka" : country);
        return a;
    }

    private ReversedAddress reverseGeocodeNominatim(double lat, double lng) {
        try {
            String url = Objects.requireNonNull(String.format(
                    "https://nominatim.openstreetmap.org/reverse?lat=%f&lon=%f&format=json&addressdetails=1",
                    lat, lng));
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "GiftMart/1.0 (https://github.com/gift-mart checkout)");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            HttpMethod get = Objects.requireNonNull(HttpMethod.GET);
            ResponseEntity<String> resp = restTemplate.exchange(url, get, entity, String.class);
            String json = resp.getBody();
            if (json == null || json.isEmpty()) {
                return null;
            }
            JsonNode root = objectMapper.readTree(json);
            JsonNode addr = root.path("address");
            ReversedAddress a = new ReversedAddress();
            a.setFormattedAddress(root.path("display_name").asText(""));
            String road = nominatimText(addr, "road");
            String house = nominatimText(addr, "house_number");
            a.setStreet((house + " " + road).trim());
            String city = firstNonBlank(
                    nominatimText(addr, "city"),
                    nominatimText(addr, "town"),
                    nominatimText(addr, "village"),
                    nominatimText(addr, "municipality"));
            a.setCity(city);
            String district = firstNonBlank(
                    nominatimText(addr, "county"),
                    nominatimText(addr, "city_district"),
                    nominatimText(addr, "state_district"));
            if (district.isBlank()) {
                district = nominatimText(addr, "suburb");
            }
            if (district.isBlank()) {
                district = city;
            }
            a.setDistrict(district);
            a.setState(firstNonBlank(nominatimText(addr, "state"), nominatimText(addr, "region")));
            a.setZip(nominatimText(addr, "postcode"));
            a.setCountry(firstNonBlank(nominatimText(addr, "country"), "Sri Lanka"));
            return a;
        } catch (Exception e) {
            return null;
        }
    }

    private static String nominatimText(JsonNode parent, String field) {
        if (parent == null || parent.isMissingNode()) {
            return "";
        }
        return parent.path(field).asText("").trim();
    }

    private static String firstNonBlank(String... parts) {
        if (parts == null) {
            return "";
        }
        for (String p : parts) {
            if (p != null && !p.isBlank()) {
                return p;
            }
        }
        return "";
    }
}
