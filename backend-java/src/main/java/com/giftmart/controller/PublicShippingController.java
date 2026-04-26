package com.giftmart.controller;

import com.giftmart.service.GoogleMapsRouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public/shipping")
public class PublicShippingController {

    private final GoogleMapsRouteService googleMapsRouteService;

    public PublicShippingController(GoogleMapsRouteService googleMapsRouteService) {
        this.googleMapsRouteService = googleMapsRouteService;
    }

    /** Default map center / dispatch hub (Jaffna). */
    @GetMapping("/hub")
    public ResponseEntity<Map<String, Object>> hub() {
        return ResponseEntity.ok(Map.of(
                "lat", googleMapsRouteService.getOriginLat(),
                "lng", googleMapsRouteService.getOriginLng(),
                "label", "Jaffna",
                "country", "Sri Lanka"));
    }
}
