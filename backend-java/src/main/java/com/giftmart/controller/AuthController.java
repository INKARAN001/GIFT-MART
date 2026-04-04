package com.giftmart.controller;

import com.giftmart.document.User;
import com.giftmart.dto.AuthRequest;
import com.giftmart.dto.AuthResponse;
import com.giftmart.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

// handles login, register, getting current user info, forgot/reset password
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // register a new user — sends verification code; no token until verify-email
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.status(201).body(authService.register(req));
    }

    // verify email with code sent on register — returns token and user
    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        return ResponseEntity.ok(authService.verifyEmail(email, code));
    }

    // resend verification code (e.g. user didn't receive email)
    @PostMapping("/resend-verification-code")
    public ResponseEntity<Map<String, String>> resendVerificationCode(@RequestBody Map<String, String> body) {
        authService.resendVerificationCode(body.get("email"));
        return ResponseEntity.ok(Map.of("message", "Verification code sent. Check your email."));
    }

    // login with email and password
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    // get current logged in user details
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        Map<String, Object> u = new LinkedHashMap<>();
        u.put("id", user.getId());
        u.put("email", user.getEmail());
        u.put("name", user.getName());
        u.put("role", user.getRole());
        u.put("phone", user.getPhone());
        u.put("address", user.getAddress());
        return ResponseEntity.ok(Map.of("user", u));
    }

    // request a password-reset token (public — no auth required)
    // In production this would email the link. Here we return the token so the
    // frontend can construct the reset URL immediately (demo/academic project).
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> body) {
        String resetToken = authService.forgotPassword(body.get("email"));
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("message", "A password-reset link has been generated.");
        res.put("resetToken", resetToken); // frontend uses this to build /reset-password?token=...
        return ResponseEntity.ok(res);
    }

    // reset password using the token received from forgot-password (public — no auth required)
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now sign in."));
    }
}
