package com.giftmart.service;

/**
 * Result of resolving delivery point and distance from Jaffna hub.
 *
 * @param shippingFeeOverrideLkr when non-null, use this shipping fee (LKR) instead of the distance tier table
 * @param routeFallback          true when Google Distance Matrix was expected but failed (Haversine / fixed km / flat fee used)
 */
public record ResolvedDelivery(
        double distanceKm,
        double destLat,
        double destLng,
        Double shippingFeeOverrideLkr,
        boolean routeFallback) {

    public ResolvedDelivery(double distanceKm, double destLat, double destLng) {
        this(distanceKm, destLat, destLng, null, false);
    }
}
