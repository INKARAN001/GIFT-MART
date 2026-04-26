package com.giftmart.controller;

import com.giftmart.document.Cart;
import com.giftmart.document.Product;
import com.giftmart.document.User;
import com.giftmart.repository.CartRepository;
import com.giftmart.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartController(CartRepository cartRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    private Cart getOrCreateCart(String userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart c = new Cart();
            c.setUserId(userId);
            return cartRepository.save(c);
        });
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCart(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        Cart cart = getOrCreateCart(user.getId());
        return ResponseEntity.ok(buildCartResponse(cart));
    }

    @PostMapping("/items")
    public ResponseEntity<?> addItem(@AuthenticationPrincipal User user,
                                     @RequestBody Map<String, Object> body) {
        if (user == null) return ResponseEntity.status(401).build();
        String productId = (String) body.get("productId");
        int quantity = parseInt(body.get("quantity"), 1);
        if (productId == null || productId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "productId is required"));
        }
        if (quantity < 1) quantity = 1;

        Optional<Product> opt = productRepository.findById(productId);
        if (opt.isEmpty() || !opt.get().isActive()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product not available"));
        }
        Product p = opt.get();
        if (p.getStock() < quantity) {
            return ResponseEntity.badRequest().body(Map.of("message", "Not enough stock"));
        }

        Cart cart = getOrCreateCart(user.getId());
        List<Cart.CartLine> items = cart.getItems();
        boolean found = false;
        for (Cart.CartLine line : items) {
            if (productId.equals(line.getProductId())) {
                int next = line.getQuantity() + quantity;
                if (p.getStock() < next) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Not enough stock"));
                }
                line.setQuantity(next);
                found = true;
                break;
            }
        }
        if (!found) {
            Cart.CartLine line = new Cart.CartLine();
            line.setProductId(productId);
            line.setQuantity(quantity);
            items.add(line);
        }
        cart.setUpdatedAt(new Date());
        cartRepository.save(cart);
        return ResponseEntity.ok(buildCartResponse(cart));
    }

    @PatchMapping("/items/{productId}")
    public ResponseEntity<?> updateQuantity(@AuthenticationPrincipal User user,
                                            @PathVariable @NonNull String productId,
                                            @RequestBody Map<String, Object> body) {
        if (user == null) return ResponseEntity.status(401).build();
        int quantity = parseInt(body.get("quantity"), 0);
        if (quantity < 1) {
            return ResponseEntity.badRequest().body(Map.of("message", "quantity must be at least 1"));
        }
        Optional<Product> opt = productRepository.findById(productId);
        if (opt.isEmpty() || !opt.get().isActive()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product not available"));
        }
        if (opt.get().getStock() < quantity) {
            return ResponseEntity.badRequest().body(Map.of("message", "Not enough stock"));
        }

        Cart cart = cartRepository.findByUserId(user.getId()).orElse(null);
        if (cart == null) return ResponseEntity.notFound().build();
        for (Cart.CartLine line : cart.getItems()) {
            if (productId.equals(line.getProductId())) {
                line.setQuantity(quantity);
                cart.setUpdatedAt(new Date());
                cartRepository.save(cart);
                return ResponseEntity.ok(buildCartResponse(cart));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<?> removeItem(@AuthenticationPrincipal User user,
                                        @PathVariable @NonNull String productId) {
        if (user == null) return ResponseEntity.status(401).build();
        Cart cart = cartRepository.findByUserId(user.getId()).orElse(null);
        if (cart == null) return ResponseEntity.ok(emptyCartResponse());
        cart.getItems().removeIf(line -> productId.equals(line.getProductId()));
        cart.setUpdatedAt(new Date());
        cartRepository.save(cart);
        return ResponseEntity.ok(buildCartResponse(cart));
    }

    private static int parseInt(Object o, int defaultVal) {
        if (o == null) return defaultVal;
        if (o instanceof Number n) return n.intValue();
        try {
            return Integer.parseInt(o.toString());
        } catch (NumberFormatException e) {
            return defaultVal;
        }
    }

    private Map<String, Object> emptyCartResponse() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("items", Collections.emptyList());
        m.put("itemCount", 0);
        m.put("subtotal", 0.0);
        return m;
    }

    private Map<String, Object> buildCartResponse(Cart cart) {
        List<Map<String, Object>> out = new ArrayList<>();
        double subtotal = 0;
        int itemCount = 0;
        for (Cart.CartLine line : cart.getItems()) {
            String linePid = line.getProductId();
            if (linePid == null || linePid.isBlank()) {
                continue;
            }
            Optional<Product> opt = productRepository.findById(linePid);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("productId", line.getProductId());
            row.put("quantity", line.getQuantity());
            if (opt.isPresent() && opt.get().isActive()) {
                Product p = opt.get();
                row.put("product", p);
                double lineTotal = p.getPrice() * line.getQuantity();
                row.put("lineTotal", lineTotal);
                subtotal += lineTotal;
                itemCount += line.getQuantity();
            } else {
                row.put("product", null);
                row.put("unavailable", true);
                row.put("lineTotal", 0.0);
            }
            out.add(row);
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("items", out);
        m.put("itemCount", itemCount);
        m.put("subtotal", subtotal);
        return m;
    }
}
