package com.giftmart.controller;

import com.giftmart.document.User;
import com.giftmart.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;

// Sprint 1: get profile, update profile, change password only
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // get current user's profile
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return userRepository.findById(user.getId())
                .map(u -> {
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
        return userRepository.findById(user.getId())
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
                            a.setState(addr.get("state"));
                            a.setZip(addr.get("zip"));
                            a.setCountry(addr.get("country"));
                            u.setAddress(a);
                        }
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
        return userRepository.findById(user.getId())
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
}
