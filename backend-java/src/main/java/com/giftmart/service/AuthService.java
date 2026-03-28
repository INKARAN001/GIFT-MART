package com.giftmart.service;

import com.giftmart.document.User;
import com.giftmart.dto.AuthRequest;
import com.giftmart.dto.AuthResponse;
import com.giftmart.repository.UserRepository;
import com.giftmart.util.EmailValidation;
import com.giftmart.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

// service class that handles login, register, forgot/reset password logic
@Service
public class AuthService {

    private static final int VERIFICATION_CODE_EXPIRY_MINUTES = 15;
    private static final int VERIFICATION_CODE_LENGTH = 6;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       @Autowired(required = false) JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.mailSender = mailSender;
    }

    // register new user — sends verification code; account not active until verify-email
    public Map<String, Object> register(AuthRequest req) {
        String email = req.getEmail() != null ? req.getEmail().toLowerCase().trim() : "";
        if (email.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
        }
        String domain = email.contains("@") ? email.substring(email.indexOf('@') + 1) : "";
        if (!EmailValidation.domainHasMxRecords(domain)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "This email domain doesn't accept mail. Please use a valid email address.");
        }

        String code = generateCode();
        Date expiry = new Date(System.currentTimeMillis() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000L);

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setName(req.getName() != null ? req.getName().trim() : email);
        user.setPhone(req.getPhone());
        user.setRole("user");
        user.setEmailVerified(false);
        user.setVerificationCode(code);
        user.setVerificationCodeExpiry(expiry);
        user = userRepository.save(user);

        String from = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : "noreply@giftmart.com";
        if (mailSender != null) {
            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setFrom(from);
                msg.setTo(email);
                msg.setSubject("Verify your Gift Mart account");
                msg.setText("Your verification code is: " + code + "\n\nIt expires in " + VERIFICATION_CODE_EXPIRY_MINUTES + " minutes.\n\n— Gift Mart");
                mailSender.send(msg);
            } catch (Exception e) {
                System.err.println("[Auth] Could not send verification email: " + e.getMessage());
                System.out.println("[Auth] Verification code for " + email + ": " + code);
            }
        } else {
            System.out.println("[Auth] Verification code for " + email + ": " + code);
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("message", "Account created. Please check your email for the verification code.");
        res.put("email", email);
        res.put("requiresVerification", true);
        return res;
    }

    public AuthResponse verifyEmail(String email, String code) {
        String normalized = email != null ? email.toLowerCase().trim() : "";
        if (normalized.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (code == null || code.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification code is required");
        }
        String trimmedCode = code.trim().replaceAll("\\s+", "");
        User user = userRepository.findByEmail(normalized)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email or code."));
        if (user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already verified. You can log in.");
        }
        if (user.getVerificationCode() == null || user.getVerificationCodeExpiry() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired code. Please register again.");
        }
        if (user.getVerificationCodeExpiry().before(new Date())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code has expired. Please request a new code.");
        }
        if (!user.getVerificationCode().equals(trimmedCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid code. Please try again.");
        }
        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        user.setUpdatedAt(new Date());
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId());
        return new AuthResponse(token, userResponse(user));
    }

    public void resendVerificationCode(String email) {
        String normalized = email != null ? email.toLowerCase().trim() : "";
        User user = userRepository.findByEmail(normalized)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No account found with this email."));
        if (user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already verified. You can log in.");
        }
        String code = generateCode();
        Date expiry = new Date(System.currentTimeMillis() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000L);
        user.setVerificationCode(code);
        user.setVerificationCodeExpiry(expiry);
        userRepository.save(user);
        String from = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : "noreply@giftmart.com";
        if (mailSender != null) {
            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setFrom(from);
                msg.setTo(normalized);
                msg.setSubject("Your Gift Mart verification code");
                msg.setText("Your verification code is: " + code + "\n\nIt expires in " + VERIFICATION_CODE_EXPIRY_MINUTES + " minutes.\n\n— Gift Mart");
                mailSender.send(msg);
            } catch (Exception e) {
                System.err.println("[Auth] Could not resend verification email: " + e.getMessage());
            }
        } else {
            System.out.println("[Auth] Verification code for " + normalized + ": " + code);
        }
    }

    private static String generateCode() {
        Random r = new Random();
        StringBuilder sb = new StringBuilder(VERIFICATION_CODE_LENGTH);
        for (int i = 0; i < VERIFICATION_CODE_LENGTH; i++) {
            sb.append(r.nextInt(10));
        }
        return sb.toString();
    }

    // login existing user — blocked if email not verified
    public AuthResponse login(AuthRequest req) {
        User user = userRepository.findByEmail(req.getEmail().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        if (!user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Please verify your email first. Check your inbox for the verification code.");
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
