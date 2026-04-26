package com.giftmart.service;

import java.util.Map;

/**
 * Reads shipping address from JSON for geocoding when lat/lng are not provided.
 */
final class OrderShippingParser {

    private OrderShippingParser() {
    }

    static ParsedAddress parse(Map<String, Object> body) {
        if (body == null || body.get("shippingAddress") == null) {
            return null;
        }
        Object raw = body.get("shippingAddress");
        if (!(raw instanceof Map<?, ?> map)) {
            return null;
        }
        ParsedAddress p = new ParsedAddress();
        p.street = str(map.get("street"));
        p.city = str(map.get("city"));
        p.district = str(map.get("district"));
        p.province = str(map.get("province"));
        if (p.province == null || p.province.isBlank()) {
            p.province = str(map.get("state"));
        }
        p.zip = str(map.get("zip"));
        p.country = str(map.get("country"));
        if (p.country == null || p.country.isBlank()) {
            p.country = "Sri Lanka";
        }
        return p;
    }

    private static String str(Object o) {
        return o == null ? null : o.toString().trim();
    }

    static class ParsedAddress {
        String street;
        String city;
        String district;
        String province;
        String zip;
        String country;

        boolean hasMinimumFields() {
            return street != null && !street.isBlank()
                    && city != null && !city.isBlank()
                    && district != null && !district.isBlank()
                    && province != null && !province.isBlank();
        }

        String geocodeQuery() {
            StringBuilder sb = new StringBuilder();
            if (street != null && !street.isBlank()) {
                sb.append(street).append(", ");
            }
            if (city != null && !city.isBlank()) {
                sb.append(city).append(", ");
            }
            if (district != null && !district.isBlank()) {
                sb.append(district).append(", ");
            }
            if (province != null && !province.isBlank()) {
                sb.append(province).append(", ");
            }
            if (country != null && !country.isBlank()) {
                sb.append(country);
            }
            return sb.toString().trim();
        }
    }
}
