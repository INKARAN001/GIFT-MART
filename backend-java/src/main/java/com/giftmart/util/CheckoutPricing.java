package com.giftmart.util;

import com.giftmart.service.ResolvedDelivery;

/**
 * Merchandise fee (2% of product subtotal) and distance-based shipping from Jaffna hub.
 */
public final class CheckoutPricing {

    private CheckoutPricing() {
    }

    /** 2% of product subtotal, rounded to whole LKR. */
    public static double merchandiseFee(double productSubtotalLkr) {
        if (productSubtotalLkr <= 0) {
            return 0;
        }
        return Math.round(productSubtotalLkr * 0.02);
    }

    /**
     * Shipping in LKR from road distance (km) from Jaffna.
     * &lt; 15 free; 15–100: 150; 100–200: 300; 200–300: 450; &gt; 300: 550.
     */
    /**
     * Uses {@link ResolvedDelivery#shippingFeeOverrideLkr()} when set (e.g. Distance Matrix failed and a flat fee is configured).
     */
    public static double shippingFeeForDelivery(ResolvedDelivery r) {
        Double o = r.shippingFeeOverrideLkr();
        if (o != null && !Double.isNaN(o) && o >= 0) {
            return o;
        }
        return shippingFee(r.distanceKm());
    }

    public static double shippingFee(double distanceKm) {
        if (distanceKm < 0 || Double.isNaN(distanceKm)) {
            return 550;
        }
        if (distanceKm < 15) {
            return 0;
        }
        if (distanceKm < 100) {
            return 150;
        }
        if (distanceKm < 200) {
            return 300;
        }
        if (distanceKm < 300) {
            return 450;
        }
        return 550;
    }

    public static double grandTotalLkr(double productSubtotal, double distanceKm) {
        return productSubtotal + merchandiseFee(productSubtotal) + shippingFee(distanceKm);
    }
}
