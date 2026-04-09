package com.giftmart.controller;

import com.giftmart.document.*;
import com.giftmart.repository.*;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.ResponseEntity;
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
    private final MongoTemplate mongoTemplate;

    public AdminController(UserRepository userRepository,
                           ProductRepository productRepository,
                           ReviewRepository reviewRepository,
                           CategoryRepository categoryRepository,
                           MongoTemplate mongoTemplate) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
        this.categoryRepository = categoryRepository;
        this.mongoTemplate = mongoTemplate;
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
        return ResponseEntity.ok(stats);
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
                                            @PathVariable String id,
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
    public ResponseEntity<?> deleteUser(@AuthenticationPrincipal User adminUser, @PathVariable String id) {
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
                                            @PathVariable String id,
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
                                            @PathVariable String id) {
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
                                                  @PathVariable String id,
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
    public ResponseEntity<?> deleteProduct(@AuthenticationPrincipal User user, @PathVariable String id) {
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
    public ResponseEntity<?> deleteReview(@AuthenticationPrincipal User user, @PathVariable String id) {
        ensureAdmin(user);
        return reviewRepository.findById(id)
                .map(r -> {
                    reviewRepository.delete(r);
                    return ResponseEntity.ok(Map.of("message", "Review deleted"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // promote a user to admin (legacy endpoint)
    @PutMapping("/users/{id}/promote")
    public ResponseEntity<?> promoteUserToAdmin(@AuthenticationPrincipal User adminUser,
                                                  @PathVariable String id) {
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

}
