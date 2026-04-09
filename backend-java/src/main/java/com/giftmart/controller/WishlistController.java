package com.giftmart.controller;

import com.giftmart.document.Cart;
import com.giftmart.document.Product;
import com.giftmart.document.User;
import com.giftmart.document.Wishlist;
import com.giftmart.repository.CartRepository;
import com.giftmart.repository.ProductRepository;
import com.giftmart.repository.WishlistRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistRepository wishlistRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public WishlistController(WishlistRepository wishlistRepository,
                                CartRepository cartRepository,
                                ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    private Wishlist getOrCreate(String userId) {
        return wishlistRepository.findByUserId(userId).orElseGet(() -> {
            Wishlist w = new Wishlist();
            w.setUserId(userId);
            return wishlistRepository.save(w);
        });
    }

    private Cart getOrCreateCart(String userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart c = new Cart();
            c.setUserId(userId);
            return cartRepository.save(c);
        });
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWishlist(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        Wishlist w = getOrCreate(user.getId());
        List<Map<String, Object>> items = new ArrayList<>();
        for (String pid : w.getProductIds()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("productId", pid);
            productRepository.findById(pid).ifPresentOrElse(
                    p -> row.put("product", p),
                    () -> row.put("product", null)
            );
            items.add(row);
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("items", items);
        body.put("count", w.getProductIds().size());
        return ResponseEntity.ok(body);
    }

    @PostMapping("/items")
    public ResponseEntity<?> add(@AuthenticationPrincipal User user,
                                 @RequestBody Map<String, String> body) {
        if (user == null) return ResponseEntity.status(401).build();
        String productId = body.get("productId");
        if (productId == null || productId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "productId is required"));
        }
        Optional<Product> opt = productRepository.findById(productId);
        if (opt.isEmpty() || !opt.get().isActive()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product not available"));
        }
        Wishlist w = getOrCreate(user.getId());
        if (!w.getProductIds().contains(productId)) {
            w.getProductIds().add(productId);
            w.setUpdatedAt(new Date());
            wishlistRepository.save(w);
        }
        return ResponseEntity.ok(Map.of("message", "Added to wishlist"));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<?> remove(@AuthenticationPrincipal User user,
                                    @PathVariable String productId) {
        if (user == null) return ResponseEntity.status(401).build();
        Wishlist w = wishlistRepository.findByUserId(user.getId()).orElse(null);
        if (w == null) return ResponseEntity.ok(Map.of("message", "Removed"));
        w.getProductIds().removeIf(productId::equals);
        w.setUpdatedAt(new Date());
        wishlistRepository.save(w);
        return ResponseEntity.ok(Map.of("message", "Removed from wishlist"));
    }

    @PostMapping("/move-to-cart")
    public ResponseEntity<?> moveToCart(@AuthenticationPrincipal User user,
                                        @RequestBody Map<String, Object> body) {
        if (user == null) return ResponseEntity.status(401).build();
        String productId = (String) body.get("productId");
        int quantity = 1;
        if (body.get("quantity") != null) {
            if (body.get("quantity") instanceof Number n) quantity = Math.max(1, n.intValue());
            else try {
                quantity = Math.max(1, Integer.parseInt(body.get("quantity").toString()));
            } catch (NumberFormatException ignored) { }
        }
        if (productId == null || productId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "productId is required"));
        }
        Optional<Product> opt = productRepository.findById(productId);
        if (opt.isEmpty() || !opt.get().isActive()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product not available"));
        }
        Product p = opt.get();
        if (p.getStock() < quantity) {
            return ResponseEntity.badRequest().body(Map.of("message", "Not enough stock"));
        }

        Cart cart = getOrCreateCart(user.getId());
        boolean merged = false;
        for (Cart.CartLine line : cart.getItems()) {
            if (productId.equals(line.getProductId())) {
                int next = line.getQuantity() + quantity;
                if (p.getStock() < next) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Not enough stock"));
                }
                line.setQuantity(next);
                merged = true;
                break;
            }
        }
        if (!merged) {
            Cart.CartLine line = new Cart.CartLine();
            line.setProductId(productId);
            line.setQuantity(quantity);
            cart.getItems().add(line);
        }
        cart.setUpdatedAt(new Date());
        cartRepository.save(cart);

        Wishlist w = wishlistRepository.findByUserId(user.getId()).orElse(null);
        if (w != null) {
            w.getProductIds().removeIf(productId::equals);
            w.setUpdatedAt(new Date());
            wishlistRepository.save(w);
        }

        return ResponseEntity.ok(Map.of("message", "Moved to cart"));
    }
}
