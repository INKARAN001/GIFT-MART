package com.giftmart.controller;

import com.giftmart.document.*;
import com.giftmart.repository.*;
import com.giftmart.service.ProductReviewStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.text.Normalizer;
import java.util.*;

// admin controller - only admin users can access these endpoints
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final FeedbackRepository feedbackRepository;
    private final MongoTemplate mongoTemplate;
    private final JavaMailSender mailSender;
    private final ProductReviewStatsService productReviewStatsService;

    /** Allowed delivery pipeline values (see {@link Order#getDeliveryStatus()}). */
    private static final Set<String> DELIVERY_STATUSES = Set.of(
            "processing", "shipped", "out_for_delivery", "delivered");

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public AdminController(UserRepository userRepository,
                           ProductRepository productRepository,
                           ReviewRepository reviewRepository,
                           CategoryRepository categoryRepository,
                           OrderRepository orderRepository,
                           FeedbackRepository feedbackRepository,
                           MongoTemplate mongoTemplate,
                           @Autowired(required = false) JavaMailSender mailSender,
                           ProductReviewStatsService productReviewStatsService) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
        this.categoryRepository = categoryRepository;
        this.orderRepository = orderRepository;
        this.feedbackRepository = feedbackRepository;
        this.mongoTemplate = mongoTemplate;
        this.mailSender = mailSender;
        this.productReviewStatsService = productReviewStatsService;
    }

    // check if user is admin, throw error if not
    private void ensureAdmin(User user) {
        if (user == null || !"admin".equalsIgnoreCase(user.getRole())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Admin access required");
        }
    }

    // get dashboard stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@AuthenticationPrincipal User user) {
        ensureAdmin(user);
        Map<String, Object> stats = new HashMap<>();
        stats.put("userCount", userRepository.countByRole("user"));
        stats.put("productCount", productRepository.count());
        stats.put("reviewCount", reviewRepository.count());
        stats.put("orderCount", orderRepository.count());
        double revenue = 0;
        for (Order o : orderRepository.findAll()) {
            revenue += o.getTotal();
        }
        stats.put("revenueTotal", Math.round(revenue * 100.0) / 100.0);
        return ResponseEntity.ok(stats);
    }

    // ── ORDERS ─────────────────────────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> adminListOrders(@AuthenticationPrincipal User admin) {
        ensureAdmin(admin);
        List<Order> orders = orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Map<String, Object>> list = new ArrayList<>();
        for (Order o : orders) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("_id", o.getId());
            row.put("userId", o.getUserId());
            row.put("total", o.getTotal());
            row.put("subtotal", o.getSubtotal());
            row.put("merchandiseFee", o.getMerchandiseFee());
            row.put("shippingFee", o.getShippingFee());
            row.put("deliveryStatus", o.getDeliveryStatus());
            row.put("paymentStatus", o.getPaymentStatus());
            row.put("status", o.getStatus());
            row.put("createdAt", o.getCreatedAt());
            row.put("trackingNumber", o.getTrackingNumber());
            row.put("paymentMethod", o.getPaymentMethod());
            userRepository.findById(o.getUserId()).ifPresent(u -> {
                row.put("customerEmail", u.getEmail());
                row.put("customerName", u.getName());
            });
            list.add(row);
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Map<String, Object>> adminGetOrder(@AuthenticationPrincipal User admin,
                                                            @PathVariable @NonNull String id) {
        ensureAdmin(admin);
        return orderRepository.findById(id)
                .map(o -> {
                    Map<String, Object> out = new LinkedHashMap<>();
                    out.put("order", o);
                    userRepository.findById(o.getUserId()).ifPresent(u -> {
                        out.put("customerEmail", u.getEmail());
                        out.put("customerName", u.getName());
                    });
                    return ResponseEntity.ok(out);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/orders/{id}")
    public ResponseEntity<?> adminPatchOrder(@AuthenticationPrincipal User admin,
                                           @PathVariable @NonNull String id,
                                           @RequestBody(required = false) Map<String, Object> body) {
        ensureAdmin(admin);
        Order o = orderRepository.findById(id).orElse(null);
        if (o == null) {
            return ResponseEntity.notFound().build();
        }
        if (body == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "body required"));
        }
        boolean touchDelivery = false;
        if (body.containsKey("deliveryStatus")) {
            String ds = body.get("deliveryStatus") != null ? body.get("deliveryStatus").toString().trim() : "";
            if (!DELIVERY_STATUSES.contains(ds)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Invalid deliveryStatus",
                        "allowed", List.of("processing", "shipped", "out_for_delivery", "delivered")));
            }
            o.setDeliveryStatus(ds);
            touchDelivery = true;
        }
        if (body.containsKey("trackingNumber")) {
            Object tn = body.get("trackingNumber");
            o.setTrackingNumber(tn == null || tn.toString().isBlank() ? null : tn.toString().trim());
            touchDelivery = true;
        }
        if (body.containsKey("paymentStatus")) {
            Object ps = body.get("paymentStatus");
            if (ps != null && !ps.toString().isBlank()) {
                o.setPaymentStatus(ps.toString().trim());
            }
        }
        if (body.containsKey("status")) {
            Object st = body.get("status");
            if (st != null && !st.toString().isBlank()) {
                o.setStatus(st.toString().trim());
            }
        }
        if (touchDelivery) {
            o.setDeliveryUpdatedAt(new Date());
        }
        orderRepository.save(o);
        return ResponseEntity.ok(o);
    }

    // ── USERS ──────────────────────────────────────────────────────────────

    // get all users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(@AuthenticationPrincipal User user) {
        ensureAdmin(user);
        List<User> allUsers = userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        allUsers.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(allUsers);
    }

    // change user role (promote/demote)
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@AuthenticationPrincipal User adminUser,
                                            @PathVariable @NonNull String id,
                                            @RequestBody Map<String, String> body) {
        ensureAdmin(adminUser);
        String newRole = body.get("role");
        if (newRole == null || (!newRole.equals("admin") && !newRole.equals("user"))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Role must be 'admin' or 'user'"));
        }
        return userRepository.findById(id)
                .map(u -> {
                    u.setRole(newRole);
                    u.setUpdatedAt(new Date());
                    userRepository.save(u);
                    return ResponseEntity.ok(Map.of("message", "Role updated to " + newRole));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // delete a user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@AuthenticationPrincipal User adminUser, @PathVariable @NonNull String id) {
        ensureAdmin(adminUser);
        if (!userRepository.existsById(id)) return ResponseEntity.notFound().build();
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    // ── CATEGORIES ─────────────────────────────────────────────────────────

    // get all categories (same data as public /api/categories; admin UI uses this with token)
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll(
                Sort.by(Sort.Order.asc("sortOrder"), Sort.Order.asc("name"))));
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@AuthenticationPrincipal User user,
                                            @RequestBody Category body) {
        ensureAdmin(user);
        if (body.getName() == null || body.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Category name is required"));
        }
        String name = body.getName().trim();
        if (categoryRepository.existsByName(name)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Category already exists"));
        }
        String slug = (body.getSlug() != null && !body.getSlug().isBlank())
                ? slugify(body.getSlug()) : slugify(name);
        if (slug.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Could not build URL slug from name"));
        }
        if (categoryRepository.existsBySlug(slug)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Slug already in use"));
        }
        Category cat = new Category();
        cat.setName(name);
        cat.setSlug(slug);
        cat.setDescription(body.getDescription());
        cat.setImage(body.getImage());
        cat.setTagline(body.getTagline());
        cat.setOverlay(body.getOverlay());
        cat.setSortOrder(body.getSortOrder() != null ? body.getSortOrder() : Integer.valueOf(0));
        return ResponseEntity.status(201).body(categoryRepository.save(cat));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@AuthenticationPrincipal User user,
                                            @PathVariable @NonNull String id,
                                            @RequestBody Category updated) {
        ensureAdmin(user);
        return categoryRepository.findById(id)
                .map(cat -> {
                    String oldName = cat.getName();
                    if (updated.getName() != null && !updated.getName().isBlank()) {
                        String newName = updated.getName().trim();
                        if (!oldName.equals(newName) && categoryRepository.existsByName(newName)) {
                            throw new org.springframework.web.server.ResponseStatusException(
                                    org.springframework.http.HttpStatus.BAD_REQUEST,
                                    "Category name already exists");
                        }
                        if (!oldName.equals(newName)) {
                            syncProductCategoryStrings(oldName, newName);
                            cat.setName(newName);
                        }
                    }
                    if (updated.getSlug() != null && !updated.getSlug().isBlank()) {
                        String newSlug = slugify(updated.getSlug());
                        if (!newSlug.equals(cat.getSlug()) && categoryRepository.existsBySlug(newSlug)) {
                            throw new org.springframework.web.server.ResponseStatusException(
                                    org.springframework.http.HttpStatus.BAD_REQUEST,
                                    "Slug already in use");
                        }
                        cat.setSlug(newSlug);
                    }
                    if (updated.getDescription() != null) {
                        cat.setDescription(updated.getDescription());
                    }
                    if (updated.getImage() != null) {
                        cat.setImage(updated.getImage());
                    }
                    if (updated.getTagline() != null) {
                        cat.setTagline(updated.getTagline());
                    }
                    if (updated.getOverlay() != null) {
                        cat.setOverlay(updated.getOverlay());
                    }
                    if (updated.getSortOrder() != null) {
                        cat.setSortOrder(updated.getSortOrder());
                    }
                    return ResponseEntity.ok(categoryRepository.save(cat));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@AuthenticationPrincipal User user,
                                            @PathVariable @NonNull String id) {
        ensureAdmin(user);
        return categoryRepository.findById(id)
                .map(cat -> {
                    long n = productRepository.countByCategory(cat.getName());
                    if (n > 0) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message",
                                        "Cannot delete: " + n + " product(s) still use category \"" + cat.getName()
                                                + "\". Remove or reassign those products first."));
                    }
                    categoryRepository.delete(cat);
                    return ResponseEntity.ok(Map.of("message", "Category deleted"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void syncProductCategoryStrings(String oldName, String newName) {
        Query q = Query.query(Criteria.where("category").is(oldName));
        Update u = new Update().set("category", newName).set("updatedAt", new Date());
        mongoTemplate.updateMulti(q, u, Product.class);
    }

    private static String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String n = Normalizer.normalize(input.trim(), Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return n.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }

    // ── PRODUCTS ───────────────────────────────────────────────────────────

    // get all products
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts(@AuthenticationPrincipal User user) {
        ensureAdmin(user);
        return ResponseEntity.ok(productRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    // add a new product
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@AuthenticationPrincipal User user,
                                                  @RequestBody Product product) {
        ensureAdmin(user);
        product.setId(null);
        product.setActive(true);
        if (product.getUnitsSold() < 0) {
            product.setUnitsSold(0);
        }
        product.setCreatedAt(new Date());
        product.setUpdatedAt(new Date());
        return ResponseEntity.status(201).body(productRepository.save(product));
    }

    // update existing product
    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@AuthenticationPrincipal User user,
                                                  @PathVariable @NonNull String id,
                                                  @RequestBody Product body) {
        ensureAdmin(user);
        return productRepository.findById(id)
                .map(p -> {
                    if (body.getName() != null) p.setName(body.getName());
                    if (body.getDescription() != null) p.setDescription(body.getDescription());
                    if (body.getCategory() != null) p.setCategory(body.getCategory());
                    if (body.getPrice() > 0) p.setPrice(body.getPrice());
                    if (body.getStock() >= 0) p.setStock(body.getStock());
                    if (body.getUnitsSold() >= 0) p.setUnitsSold(body.getUnitsSold());
                    if (body.getImage() != null) p.setImage(body.getImage());
                    p.setCustomizable(body.isCustomizable());
                    if (body.getCustomOptions() != null) p.setCustomOptions(body.getCustomOptions());
                    p.setUpdatedAt(new Date());
                    return ResponseEntity.ok(productRepository.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // delete product
    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@AuthenticationPrincipal User user, @PathVariable @NonNull String id) {
        ensureAdmin(user);
        if (!productRepository.existsById(id)) return ResponseEntity.notFound().build();
        productRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted"));
    }

    // ── REVIEWS ────────────────────────────────────────────────────────────

    // get all reviews
    @GetMapping("/reviews")
    public ResponseEntity<List<Review>> getAllReviews(@AuthenticationPrincipal User user) {
        ensureAdmin(user);
        return ResponseEntity.ok(reviewRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    // delete a review
    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<?> deleteReview(@AuthenticationPrincipal User user, @PathVariable @NonNull String id) {
        ensureAdmin(user);
        return reviewRepository.findById(id)
                .map(r -> {
                    String pid = r.getProduct() != null ? r.getProduct().getId() : null;
                    reviewRepository.delete(r);
                    if (pid != null) {
                        productReviewStatsService.refreshForProduct(pid);
                    }
                    return ResponseEntity.ok(Map.of("message", "Review deleted"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/reviews/{id}/moderation")
    public ResponseEntity<?> moderateReview(@AuthenticationPrincipal User user,
                                            @PathVariable @NonNull String id,
                                            @RequestBody Map<String, String> body) {
        ensureAdmin(user);
        String status = body != null ? body.get("status") : null;
        if (status == null || (!status.equalsIgnoreCase("approved")
                && !status.equalsIgnoreCase("rejected")
                && !status.equalsIgnoreCase("pending"))) {
            return ResponseEntity.badRequest().body(Map.of("message", "status must be pending, approved, or rejected"));
        }
        return reviewRepository.findById(id)
                .map(r -> {
                    r.setModerationStatus(status.toLowerCase());
                    r.setCreatedAt(r.getCreatedAt() != null ? r.getCreatedAt() : new Date());
                    reviewRepository.save(r);
                    String pid = r.getProduct() != null ? r.getProduct().getId() : null;
                    if (pid != null) {
                        productReviewStatsService.refreshForProduct(pid);
                    }
                    return ResponseEntity.ok(Map.of("message", "Review updated", "moderationStatus", r.getModerationStatus()));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/reviews/{id}")
    public ResponseEntity<?> editReview(@AuthenticationPrincipal User user,
                                        @PathVariable @NonNull String id,
                                        @RequestBody Map<String, Object> body) {
        ensureAdmin(user);
        return reviewRepository.findById(id)
                .map(r -> {
                    if (body.get("comment") != null) {
                        r.setComment(body.get("comment").toString());
                    }
                    if (body.get("rating") instanceof Number n) {
                        int rt = n.intValue();
                        if (rt >= 1 && rt <= 5) {
                            r.setRating(rt);
                        }
                    }
                    reviewRepository.save(Objects.requireNonNull(r));
                    String pid = r.getProduct() != null ? r.getProduct().getId() : null;
                    if (pid != null) {
                        productReviewStatsService.refreshForProduct(pid);
                    }
                    return ResponseEntity.ok(r);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Send a promotional email to users who did not opt out ({@code notifyPromotions} ≠ false). */
    @PostMapping("/promotions/send")
    public ResponseEntity<?> sendPromotions(@AuthenticationPrincipal User user,
                                            @RequestBody Map<String, String> body) {
        ensureAdmin(user);
        String subject = body != null ? body.get("subject") : null;
        String text = body != null ? body.get("body") : null;
        if (subject == null || subject.isBlank() || text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "subject and body are required"));
        }
        List<User> users = userRepository.findAll();
        int sent = 0;
        int skipped = 0;
        String fromAddr = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : "noreply@giftmart.com";
        for (User u : users) {
            if (!"user".equalsIgnoreCase(u.getRole())) {
                continue;
            }
            if (Boolean.FALSE.equals(u.getNotifyPromotions())) {
                skipped++;
                continue;
            }
            String email = u.getEmail();
            if (email == null || email.isBlank()) {
                skipped++;
                continue;
            }
            if (u.getUnsubscribeToken() == null || u.getUnsubscribeToken().isBlank()) {
                u.setUnsubscribeToken(java.util.UUID.randomUUID().toString().replace("-", ""));
                u.setUpdatedAt(new Date());
                userRepository.save(u);
            }
            String base = frontendUrl.replaceAll("/$", "");
            String footer = "\n\n— Gift Mart\nManage emails: " + base + "/profile"
                    + "\nUnsubscribe from promotions: " + base + "/unsubscribe?t=" + u.getUnsubscribeToken() + "&channel=promotions";
            if (mailSender != null) {
                try {
                    SimpleMailMessage msg = new SimpleMailMessage();
                    msg.setFrom(fromAddr);
                    msg.setTo(email);
                    msg.setSubject(subject.trim());
                    msg.setText(text.trim() + footer);
                    mailSender.send(msg);
                    sent++;
                } catch (Exception e) {
                    System.err.println("[PromoMail] skip " + email + ": " + e.getMessage());
                    skipped++;
                }
            } else {
                System.out.println("[PromoMail] No mailer — would send to " + email + ": " + subject);
                sent++;
            }
        }
        return ResponseEntity.ok(Map.of("sent", sent, "skipped", skipped));
    }

    // promote a user to admin (legacy endpoint)
    @PutMapping("/users/{id}/promote")
    public ResponseEntity<?> promoteUserToAdmin(@AuthenticationPrincipal User adminUser,
                                                  @PathVariable @NonNull String id) {
        ensureAdmin(adminUser);
        return userRepository.findById(id)
                .map(u -> {
                    u.setRole("admin");
                    u.setUpdatedAt(new Date());
                    userRepository.save(u);
                    return ResponseEntity.ok(Map.of("message", "User promoted to admin"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ── CUSTOMER FEEDBACK (from /track-order page) ───────────────────────

    @GetMapping("/feedback")
    public ResponseEntity<List<Feedback>> listFeedback(@AuthenticationPrincipal User admin) {
        ensureAdmin(admin);
        return ResponseEntity.ok(feedbackRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")));
    }

}
