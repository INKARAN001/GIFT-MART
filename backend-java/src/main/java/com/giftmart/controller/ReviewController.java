package com.giftmart.controller;

import com.giftmart.document.Review;
import com.giftmart.repository.ReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Map<String, Object>>> listByProduct(@PathVariable String productId) {
        List<Map<String, Object>> out = reviewRepository
                .findByProduct_IdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::toPublic)
                .collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    private Map<String, Object> toPublic(Review r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id", r.getId());
        m.put("rating", r.getRating());
        m.put("comment", r.getComment());
        m.put("userName", r.getUserName() != null ? r.getUserName() : "Customer");
        m.put("createdAt", r.getCreatedAt());
        return m;
    }
}
