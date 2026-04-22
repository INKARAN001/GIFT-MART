package com.giftmart.controller;

import com.giftmart.document.Product;
import com.giftmart.document.Review;
import com.giftmart.document.User;
import com.giftmart.repository.OrderRepository;
import com.giftmart.repository.ProductRepository;
import com.giftmart.repository.ReviewRepository;
import com.giftmart.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public ReviewController(ReviewRepository reviewRepository,
                            ProductRepository productRepository,
                            UserRepository userRepository,
                            OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    /** Whether the signed-in user already submitted a review for this product. */
    @GetMapping("/me/product/{productId}")
    public ResponseEntity<Map<String, Object>> myReviewForProduct(@AuthenticationPrincipal User principal,
                                                                   @PathVariable @NonNull String productId) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String uid = Objects.requireNonNull(principal.getId(), "user id");
        boolean purchased = orderRepository.existsPaidOrderContainingProduct(uid, productId);
        Optional<Review> opt = reviewRepository.findByProduct_IdAndUser_Id(productId, uid);
        if (opt.isEmpty()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("hasReview", false);
            m.put("canReview", purchased);
            return ResponseEntity.ok(m);
        }
        Review r = opt.get();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("hasReview", true);
        m.put("canReview", false);
        m.put("moderationStatus", r.getModerationStatus() != null ? r.getModerationStatus() : "pending");
        return ResponseEntity.ok(m);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Map<String, Object>>> listByProduct(@PathVariable @NonNull String productId) {
        List<Map<String, Object>> out = reviewRepository
                .findByProduct_IdOrderByCreatedAtDesc(productId)
                .stream()
                .filter(this::isApprovedForDisplay)
                .map(this::toPublic)
                .collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal User principal,
                                    @RequestBody Map<String, Object> body) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Sign in to leave a review"));
        }
        if (body == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Body required"));
        }
        String productId = body.get("productId") != null ? body.get("productId").toString().trim() : "";
        if (productId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "productId required"));
        }
        int rating = 0;
        if (body.get("rating") instanceof Number n) {
            rating = n.intValue();
        } else if (body.get("rating") != null) {
            try {
                rating = Integer.parseInt(body.get("rating").toString());
            } catch (NumberFormatException ignored) {
                rating = 0;
            }
        }
        if (rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().body(Map.of("message", "Rating must be 1–5"));
        }
        String comment = body.get("comment") != null ? body.get("comment").toString().trim() : "";
        if (comment.length() < 3) {
            return ResponseEntity.badRequest().body(Map.of("message", "Comment must be at least 3 characters"));
        }
        if (comment.length() > 2000) {
            return ResponseEntity.badRequest().body(Map.of("message", "Comment too long"));
        }

        String pid = Objects.requireNonNull(productId, "productId");
        Optional<Product> pOpt = productRepository.findById(pid);
        if (pOpt.isEmpty() || !pOpt.get().isActive()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product not found"));
        }
        Product product = pOpt.get();
        String principalUserId = Objects.requireNonNull(principal.getId(), "user id");
        User userRef = userRepository.findById(principalUserId).orElse(principal);
        if (reviewRepository.existsByUser_IdAndProduct_Id(principalUserId, pid)) {
            return ResponseEntity.badRequest().body(Map.of("message", "You already reviewed this product"));
        }
        if (!orderRepository.existsPaidOrderContainingProduct(principalUserId, pid)) {
            return ResponseEntity.status(403).body(Map.of(
                    "message", "You can only review products you have purchased (paid orders)."));
        }

        Review r = new Review();
        r.setUser(userRef);
        r.setProduct(product);
        r.setRating(rating);
        r.setComment(comment);
        r.setUserName(userRef.getName() != null ? userRef.getName() : "Customer");
        r.setUserEmail(userRef.getEmail());
        r.setModerationStatus("pending");
        r.setProductName(product.getName());
        r.setCreatedAt(new Date());
        reviewRepository.save(r);

        return ResponseEntity.status(201).body(Map.of(
                "message", "Thanks! Your review is pending moderation.",
                "moderationStatus", "pending"
        ));
    }

    private boolean isApprovedForDisplay(Review r) {
        String m = r.getModerationStatus();
        return m == null || m.isBlank() || "approved".equalsIgnoreCase(m);
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
