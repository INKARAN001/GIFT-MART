package com.giftmart.controller;

import com.giftmart.document.Order;
import com.giftmart.document.User;
import com.giftmart.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<Order> placeOrder(@AuthenticationPrincipal User user,
                                            @RequestBody(required = false) Map<String, Object> body) {
        String paymentMethod = "cod";
        if (body != null && body.get("paymentMethod") != null) {
            paymentMethod = body.get("paymentMethod").toString();
        }
        Order order = orderService.placeOrder(user, paymentMethod);
        return ResponseEntity.ok(order);
    }
}
