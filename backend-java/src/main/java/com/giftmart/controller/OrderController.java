package com.giftmart.controller;

import com.giftmart.document.Order;
import com.giftmart.document.User;
import com.giftmart.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<Order>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.listForUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOne(@AuthenticationPrincipal User user, @PathVariable @NonNull String id) {
        return ResponseEntity.ok(orderService.getOrderForUser(user, id));
    }

    @PostMapping
    public ResponseEntity<Order> placeOrder(@AuthenticationPrincipal User user,
                                            @RequestBody(required = false) Map<String, Object> body) {
        Order order = orderService.placeOrder(user, body != null ? body : Map.of());
        return ResponseEntity.ok(order);
    }

    /**
     * Same body and behavior as {@link #placeOrder} — use after Stripe succeeded but the client never got a response
     * (tab crash, network drop). If an order for this PaymentIntent already exists for the user, it is returned without
     * duplicating stock/cart changes.
     */
    @PostMapping("/recover")
    public ResponseEntity<Order> recoverOrder(@AuthenticationPrincipal User user,
                                              @RequestBody(required = false) Map<String, Object> body) {
        Order order = orderService.placeOrder(user, body != null ? body : Map.of());
        return ResponseEntity.ok(order);
    }
}
