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

import java.util.LinkedHashMap;
import java.util.Map;

// service class that handles login and register logic
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
