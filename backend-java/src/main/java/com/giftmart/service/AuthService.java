package com.giftmart.service;

import com.giftmart.document.User;
import com.giftmart.dto.AuthRequest;
import com.giftmart.dto.AuthResponse;
import com.giftmart.repository.UserRepository;
import com.giftmart.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

// service class that handles login, register, forgot/reset password logic
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // register new user
    public AuthResponse register(AuthRequest req) {
        // check if email already exists
        if (userRepository.existsByEmail(req.getEmail().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
        }
        User user = new User();
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword())); // hash password
        user.setName(req.getName() != null ? req.getName().trim() : req.getEmail());
        user.setPhone(req.getPhone()); // save phone number to database
        user.setRole("user");
        user = userRepository.save(user);
        System.out.println("New user registered: " + user.getEmail() + " (saved to MongoDB)");
        String token = jwtUtil.generateToken(user.getId()); // generate jwt token
        return new AuthResponse(token, userResponse(user));
    }

    // login existing user
    public AuthResponse login(AuthRequest req) {
        // find user by email
        User user = userRepository.findByEmail(req.getEmail().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        // check password
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        System.out.println("User logged in: " + user.getEmail() + " (role: " + user.getRole() + ")");
        String token = jwtUtil.generateToken(user.getId());
        return new AuthResponse(token, userResponse(user));
    }

    // forgot password — generates a secure token stored on the user (expires in 1 hour)
    // Returns the token so the frontend can redirect to the reset page.
    // In a production app you would email this link instead of returning it.
    public String forgotPassword(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        // Always return success even if email not found (prevents user enumeration)
        User user = userRepository.findByEmail(email.toLowerCase().trim()).orElse(null);
        if (user == null) {
            // Return a fake token so we don't reveal whether the email exists
            return UUID.randomUUID().toString();
        }
        // Generate a random secure token
        String token = UUID.randomUUID().toString();
        // Token valid for 1 hour
        Date expiry = new Date(System.currentTimeMillis() + 60 * 60 * 1000);
        user.setResetToken(token);
        user.setResetTokenExpiry(expiry);
        userRepository.save(user);
        System.out.println("Password reset token generated for: " + user.getEmail());
        return token;
    }

    // reset password — validates the token, checks expiry, updates password
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token is required");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 6 characters");
        }
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token"));

        // Check token expiry
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().before(new Date())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);       // invalidate token after use
        user.setResetTokenExpiry(null);
        user.setUpdatedAt(new Date());
        userRepository.save(user);
        System.out.println("Password reset successfully for user: " + user.getEmail());
    }

    // helper to create user response (without password)
    private Map<String, Object> userResponse(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.getId());
        map.put("email", user.getEmail());
        map.put("name", user.getName());
        map.put("role", user.getRole());
        map.put("phone", user.getPhone());
        return map;
    }
}
