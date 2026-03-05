package com.giftmart.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

// utility class for creating and validating JWT tokens
@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expirationMs;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration:7d}") String expiration) {
        // make sure secret key is at least 32 characters
        String s = secret.length() >= 32 ? secret : secret + "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
        this.key = Keys.hmacShaKeyFor(s.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = parseExpiration(expiration);
    }

    // parse expiration string like "7d", "24h", "30m" into milliseconds
    private static long parseExpiration(String exp) {
        if (exp == null || exp.isEmpty()) return 7 * 24 * 60 * 60 * 1000L; // default 7 days
        exp = exp.trim().toLowerCase();
        long mult = 1000;
        if (exp.endsWith("d")) mult = 24 * 60 * 60 * 1000L;
        else if (exp.endsWith("h")) mult = 60 * 60 * 1000L;
        else if (exp.endsWith("m")) mult = 60 * 1000L;
        try {
            long val = Long.parseLong(exp.replaceAll("[^0-9]", ""));
            return val * mult;
        } catch (NumberFormatException e) {
            return 7 * 24 * 60 * 60 * 1000L;
        }
    }

    // generate a new jwt token for a user
    public String generateToken(String userId) {
        return Jwts.builder()
                .subject(userId)
                .claim("id", userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    // get user id from token
    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        Object id = claims.get("id");
        if (id != null) return id.toString();
        return claims.getSubject();
    }

    // check if token is valid
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
