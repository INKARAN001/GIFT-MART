package com.giftmart.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Stripe charges. Product prices in the app are LKR; Stripe may charge in USD (or LKR) depending on
 * {@code stripe.charge.currency}. Default is {@code usd} because many regions (including typical
 * Sri Lanka merchant setups) cannot use LKR on Stripe — use a Stripe account from a supported
 * country and set {@code stripe.lkr-per-usd} to the current FX rate (LKR for 1 USD).
 */
@Service
public class StripePaymentService {

    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    /** Currency Stripe will charge in: {@code usd} (default) or {@code lkr} if your Stripe account supports it. */
    @Value("${stripe.charge.currency:usd}")
    private String chargeCurrency;

    /**
     * How many LKR equal 1 unit of {@code stripe.charge.currency} when that currency is {@code usd}.
     * Example: 320 means 1 USD = 320 LKR, so a 3,200 LKR cart → 10.00 USD.
     */
    @Value("${stripe.lkr-per-usd:320}")
    private double lkrPerUsd;

    public boolean isConfigured() {
        return stripeSecretKey != null && !stripeSecretKey.isBlank();
    }

    public String getChargeCurrency() {
        return chargeCurrency == null ? "usd" : chargeCurrency.trim().toLowerCase();
    }

    /**
     * Smallest units for Stripe: USD/EUR = cents; LKR = cents (paisa) per Stripe API for LKR.
     */
    public long computeChargeAmountMinorFromLkr(double totalLkr) {
        if (totalLkr <= 0) {
            return 0;
        }
        String c = getChargeCurrency();
        if ("lkr".equals(c)) {
            return Math.round(totalLkr * 100.0);
        }
        if ("usd".equals(c)) {
            if (lkrPerUsd <= 0) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Set stripe.lkr-per-usd (LKR per 1 USD) when stripe.charge.currency=usd");
            }
            double usd = totalLkr / lkrPerUsd;
            long cents = Math.round(usd * 100.0);
            if (cents < 50) {
                // Stripe minimum charge is typically 50 cents USD
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Order total is below the minimum card charge after conversion. Add items or adjust the rate.");
            }
            return cents;
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Unsupported stripe.charge.currency: " + c + ". Use usd or lkr.");
    }

    /**
     * Re-fetches the PaymentIntent from Stripe (server truth) and only allows order creation when status is {@code succeeded}.
     * Guards against client/UI mismatch after tab close, network drops, or stale UI state.
     *
     * @param amountMinor smallest currency unit for the PaymentIntent’s currency (must match {@link #getChargeCurrency()})
     */
    public void assertPaymentIntentSucceeded(String paymentIntentId, long amountMinor) {
        if (!isConfigured()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Card payments require Stripe configuration");
        }
        Stripe.apiKey = stripeSecretKey;
        try {
            PaymentIntent pi = PaymentIntent.retrieve(paymentIntentId);
            if (!"succeeded".equals(pi.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment not completed");
            }
            if (pi.getAmount() != null && pi.getAmount() != amountMinor) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment amount mismatch");
            }
        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not verify payment: " + e.getMessage());
        }
    }

    public String createPaymentIntent(long amountMinor, String currency) throws StripeException {
        Stripe.apiKey = stripeSecretKey;
        String cur = currency != null ? currency.trim().toLowerCase() : "usd";
        // Card only — avoids extra UI (e.g. Link / wallets) that Stripe adds in a corner with automatic_payment_methods
        com.stripe.param.PaymentIntentCreateParams params = com.stripe.param.PaymentIntentCreateParams.builder()
                .setAmount(amountMinor)
                .setCurrency(cur)
                .addPaymentMethodType("card")
                .build();
        PaymentIntent pi = PaymentIntent.create(params);
        return pi.getClientSecret();
    }
}
