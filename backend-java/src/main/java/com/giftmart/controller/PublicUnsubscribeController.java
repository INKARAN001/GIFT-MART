package com.giftmart.controller;

import com.giftmart.document.User;
import com.giftmart.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicUnsubscribeController {

    private final UserRepository userRepository;

    public PublicUnsubscribeController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * One-click unsubscribe from email links.
     * @param channel all | promotions | reminders
     */
    @GetMapping("/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(@RequestParam String t,
                                                           @RequestParam(defaultValue = "all") String channel) {
        if (t == null || t.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid link"));
        }
        User u = userRepository.findByUnsubscribeToken(t).orElse(null);
        if (u == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired link"));
        }
        String ch = channel != null ? channel.toLowerCase() : "all";
        if ("all".equals(ch)) {
            u.setNotifyPromotions(false);
            u.setNotifyEventReminders(false);
        } else if ("promotions".equals(ch)) {
            u.setNotifyPromotions(false);
        } else if ("reminders".equals(ch)) {
            u.setNotifyEventReminders(false);
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Unknown channel"));
        }
        u.setUpdatedAt(new Date());
        userRepository.save(u);
        return ResponseEntity.ok(Map.of("message", "Your preferences have been updated."));
    }
}
