package com.giftmart.controller;

import com.giftmart.document.Order;
import com.giftmart.document.User;
import com.giftmart.repository.UserRepository;
import com.giftmart.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

// Sprint 1: get profile, update profile, change password only
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OrderService orderService;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder,
                          OrderService orderService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.orderService = orderService;
    }

    // orders placed by the current user (newest first)
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(orderService.listForUser(user));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Order> getMyOrder(@AuthenticationPrincipal User user, @PathVariable @NonNull String orderId) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(orderService.getOrderForUser(user, orderId));
    }

    // get current user's profile
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        String uid = Objects.requireNonNull(user.getId(), "user id");
        return userRepository.findById(uid)
                .map(u -> {
                    ensureUnsubscribeToken(u);
                    u.setPassword(null);
                    return ResponseEntity.ok(u);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // update current user's profile (name, phone, address)
    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal User user,
                                               @RequestBody Map<String, Object> body) {
        if (user == null) return ResponseEntity.status(401).build();
        String uid = Objects.requireNonNull(user.getId(), "user id");
        return userRepository.findById(uid)
                .map(u -> {
                    if (body.containsKey("name"))
                        u.setName((String) body.get("name"));
                    if (body.containsKey("phone"))
                        u.setPhone((String) body.get("phone"));
                    if (body.containsKey("address")) {
                        @SuppressWarnings("unchecked")
                        Map<String, String> addr = (Map<String, String>) body.get("address");
                        if (addr != null) {
                            User.Address a = new User.Address();
                            a.setStreet(addr.get("street"));
                            a.setCity(addr.get("city"));
                            a.setDistrict(addr.get("district"));
                            a.setState(addr.get("state"));
                            a.setZip(addr.get("zip"));
                            a.setCountry(addr.get("country"));
                            u.setAddress(a);
                        }
                    }
                    if (body.containsKey("notifyEventReminders")) {
                        u.setNotifyEventReminders(parseBooleanObject(body.get("notifyEventReminders")));
                    }
                    if (body.containsKey("notifyPromotions")) {
                        u.setNotifyPromotions(parseBooleanObject(body.get("notifyPromotions")));
                    }
                    u.setUpdatedAt(new Date());
                    User saved = userRepository.save(u);
                    saved.setPassword(null);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // change password — requires current password verification
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal User user,
                                             @RequestBody Map<String, String> body) {
        if (user == null) return ResponseEntity.status(401).build();
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");
        if (currentPassword == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid password data — new password must be at least 6 characters"));
        }
        String uid = Objects.requireNonNull(user.getId(), "user id");
        return userRepository.findById(uid)
                .map(u -> {
                    if (!passwordEncoder.matches(currentPassword, u.getPassword())) {
                        return ResponseEntity.status(400)
                                .body(Map.of("message", "Current password is incorrect"));
                    }
                    u.setPassword(passwordEncoder.encode(newPassword));
                    u.setUpdatedAt(new Date());
                    userRepository.save(u);
                    return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void ensureUnsubscribeToken(User u) {
        if (u.getUnsubscribeToken() == null || u.getUnsubscribeToken().isBlank()) {
            u.setUnsubscribeToken(UUID.randomUUID().toString().replace("-", ""));
            u.setUpdatedAt(new Date());
            userRepository.save(u);
        }
    }

    private static Boolean parseBooleanObject(Object v) {
        if (v instanceof Boolean b) {
            return b;
        }
        if (v == null) {
            return null;
        }
        return Boolean.parseBoolean(v.toString());
    }
}
