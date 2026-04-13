package com.giftmart.controller;

import com.giftmart.document.User;
import com.giftmart.dto.ReversedAddress;
import com.giftmart.service.GoogleMapsRouteService;
import com.giftmart.service.OrderService;
import com.giftmart.service.ResolvedDelivery;
import com.giftmart.util.CheckoutPricing;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/shipping")
public class ShippingController {

    private final OrderService orderService;
    private final GoogleMapsRouteService googleMapsRouteService;

    public ShippingController(OrderService orderService, GoogleMapsRouteService googleMapsRouteService) {
        this.orderService = orderService;
        this.googleMapsRouteService = googleMapsRouteService;
    }

    /**
     * Quote merchandise (2%), shipping by distance from Jaffna, and grand total. Requires cart + delivery info.
     */
    @PostMapping("/quote")
    public ResponseEntity<Map<String, Object>> quote(
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) Map<String, Object> body) {
        double subtotal = orderService.computeCartTotal(user);
        if (subtotal <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cart is empty"));
        }
        ResolvedDelivery resolved = googleMapsRouteService.resolveDelivery(body != null ? body : Map.of());
        double merch = CheckoutPricing.merchandiseFee(subtotal);
        double ship = CheckoutPricing.shippingFeeForDelivery(resolved);
        double grand = subtotal + merch + ship;
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("subtotal", subtotal);
        out.put("merchandiseFee", merch);
        out.put("shippingFee", ship);
        if (resolved.shippingFeeOverrideLkr() != null) {
            out.put("shippingFeeOverrideLkr", resolved.shippingFeeOverrideLkr());
        }
        out.put("distanceKm", Math.round(resolved.distanceKm() * 10.0) / 10.0);
        out.put("grandTotalLkr", grand);
        out.put("hub", Map.of(
                "lat", googleMapsRouteService.getOriginLat(),
                "lng", googleMapsRouteService.getOriginLng(),
                "label", "Jaffna"));
        out.put("deliveryLat", resolved.destLat());
        out.put("deliveryLng", resolved.destLng());
        out.put("fallback", resolved.routeFallback());
        return ResponseEntity.ok(out);
    }

    /**
     * Reverse geocode coordinates into street / city / district / province (live location or map pin).
     */
    @PostMapping("/reverse-geocode")
    public ResponseEntity<Map<String, Object>> reverseGeocode(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Object latObj = body != null ? body.get("lat") : null;
        Object lngObj = body != null ? body.get("lng") : null;
        if (latObj == null || lngObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "lat and lng are required"));
        }
        double lat;
        double lng;
        try {
            lat = latObj instanceof Number n ? n.doubleValue() : Double.parseDouble(latObj.toString().trim());
            lng = lngObj instanceof Number n ? n.doubleValue() : Double.parseDouble(lngObj.toString().trim());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid lat or lng"));
        }
        ReversedAddress addr = googleMapsRouteService.reverseGeocode(lat, lng);
        Map<String, Object> out = new LinkedHashMap<>();
        addr.toMap().forEach(out::put);
        out.put("addressIncomplete", addr.isIncomplete());
        return ResponseEntity.ok(out);
    }
}
