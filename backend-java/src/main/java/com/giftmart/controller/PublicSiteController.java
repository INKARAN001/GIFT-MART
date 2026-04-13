package com.giftmart.controller;

import com.giftmart.document.Feedback;
import com.giftmart.repository.FeedbackRepository;
import com.giftmart.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;

/**
 * Public endpoints (no login): order tracking by id + email, feedback form.
 */
@RestController
@RequestMapping("/api/public")
public class PublicSiteController {

    private final OrderService orderService;
    private final FeedbackRepository feedbackRepository;

    public PublicSiteController(OrderService orderService, FeedbackRepository feedbackRepository) {
        this.orderService = orderService;
        this.feedbackRepository = feedbackRepository;
    }

    @PostMapping("/orders/track")
    public ResponseEntity<Map<String, Object>> trackOrder(@RequestBody Map<String, String> body) {
        String orderId = body != null && body.get("orderId") != null ? body.get("orderId") : "";
        String email = body != null && body.get("email") != null ? body.get("email") : "";
        return ResponseEntity.ok(orderService.trackOrderPublic(orderId, email));
    }

    @PostMapping("/feedback")
    public ResponseEntity<Map<String, String>> submitFeedback(@RequestBody Map<String, String> body) {
        if (body == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Body required"));
        }
        String email = Objects.toString(body.get("email"), "").trim();
        String name = Objects.toString(body.get("name"), "").trim();
        String message = Objects.toString(body.get("message"), "").trim();
        if (email.isEmpty() || !email.contains("@")) {
            return ResponseEntity.badRequest().body(Map.of("message", "A valid email is required"));
        }
        if (message.length() < 10) {
            return ResponseEntity.badRequest().body(Map.of("message", "Message must be at least 10 characters"));
        }
        if (message.length() > 4000) {
            return ResponseEntity.badRequest().body(Map.of("message", "Message is too long"));
        }
        Feedback f = new Feedback();
        f.setEmail(email);
        f.setName(name);
        f.setMessage(message);
        feedbackRepository.save(f);
        return ResponseEntity.status(201).body(Map.of("message", "Thanks — we received your feedback."));
    }
}
