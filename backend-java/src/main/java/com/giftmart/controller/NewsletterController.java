package com.giftmart.controller;

import com.giftmart.service.NewsletterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    private final NewsletterService newsletterService;

    public NewsletterController(NewsletterService newsletterService) {
        this.newsletterService = newsletterService;
    }

    @PostMapping("/send-code")
    public ResponseEntity<Map<String, String>> sendCode(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        var codeOpt = newsletterService.sendCode(email);
        Map<String, String> res = new LinkedHashMap<>();
        res.put("message", "Verification code sent to your email.");
        codeOpt.ifPresent(code -> res.put("code", code)); // only when email wasn't sent (e.g. dev / no mail)
        return ResponseEntity.ok(res);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verify(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        newsletterService.verify(email, code);
        return ResponseEntity.ok(Map.of("message", "You are now subscribed."));
    }
}
