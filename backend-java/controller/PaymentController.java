package com.giftmart.controller;

import com.giftmart.document.User;
import com.giftmart.service.GoogleMapsRouteService;
import com.giftmart.service.OrderService;
import com.giftmart.service.ResolvedDelivery;
import com.giftmart.service.StripePaymentService;
import com.giftmart.util.CheckoutPricing;
import com.stripe.exception.StripeException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final OrderService orderService;
    private final StripePaymentService stripePaymentService;
    private final GoogleMapsRouteService googleMapsRouteService;

    public PaymentController(OrderService orderService,
                             StripePaymentService stripePaymentService,
                             GoogleMapsRouteService googleMapsRouteService) {
        this.orderService = orderService;
        this.stripePaymentService = stripePaymentService;
        this.googleMapsRouteService = googleMapsRouteService;
    }

    /**
     * Creates a Stripe PaymentIntent for the current cart total. Cart is priced in LKR; the intent
     * currency is {@code stripe.charge.currency} (default {@code usd} for accounts that cannot charge LKR).
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, Object>> createPaymentIntent(
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> out = new LinkedHashMap<>();
        if (!stripePaymentService.isConfigured()) {
            out.put("error", "Stripe is not configured. Set stripe.secret.key (e.g. in application-local.properties or STRIPE_SECRET_KEY env).");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(out);
        }
        double subtotal = orderService.computeCartTotal(user);
        if (subtotal <= 0) {
            out.put("error", "Cart is empty or total is zero");
            return ResponseEntity.badRequest().body(out);
        }
        try {
            ResolvedDelivery resolved = googleMapsRouteService.resolveDelivery(
                    body != null ? body : java.util.Map.of());
            double merch = CheckoutPricing.merchandiseFee(subtotal);
            double ship = CheckoutPricing.shippingFeeForDelivery(resolved);
            double grandTotalLkr = subtotal + merch + ship;
            long amountMinor = stripePaymentService.computeChargeAmountMinorFromLkr(grandTotalLkr);
            String currency = stripePaymentService.getChargeCurrency();
            String clientSecret = stripePaymentService.createPaymentIntent(amountMinor, currency);
            out.put("clientSecret", clientSecret);
            out.put("amountMinor", amountMinor);
            out.put("currency", currency);
            out.put("totalLkr", grandTotalLkr);
            out.put("subtotalLkr", subtotal);
            out.put("merchandiseFeeLkr", merch);
            out.put("shippingFeeLkr", ship);
            out.put("distanceKm", Math.round(resolved.distanceKm() * 10.0) / 10.0);
            out.put("fallback", resolved.routeFallback());
            return ResponseEntity.ok(out);
        } catch (ResponseStatusException e) {
            out.put("error", e.getReason() != null ? e.getReason() : "Payment error");
            return ResponseEntity.status(e.getStatusCode()).body(out);
        } catch (StripeException e) {
            out.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(out);
        }
    }
}
