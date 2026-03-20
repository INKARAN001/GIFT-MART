package com.giftmart.service;

import com.giftmart.document.NewsletterSubscriber;
import com.giftmart.repository.NewsletterSubscriberRepository;
import com.giftmart.util.EmailValidation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.annotation.PostConstruct;

import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NewsletterService {

    private static final int CODE_EXPIRY_MINUTES = 15;
    private static final int CODE_LENGTH = 6;

    private final NewsletterSubscriberRepository subscriberRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Value("${app.newsletter.from:}")
    private String newsletterFromOverride;

    // in-memory: email -> { code, expiry }
    private final Map<String, PendingCode> pendingCodes = new ConcurrentHashMap<>();

    public NewsletterService(NewsletterSubscriberRepository subscriberRepository,
                              @Autowired(required = false) JavaMailSender mailSender) {
        this.subscriberRepository = subscriberRepository;
        this.mailSender = mailSender;
    }

    @PostConstruct
    public void logMailConfig() {
        if (mailSender == null) {
            System.out.println("[Newsletter] Mail sender is NOT configured (JavaMailSender bean missing). Codes will be printed to console only.");
        } else if (mailFrom == null || mailFrom.isBlank()) {
            System.out.println("[Newsletter] Mail username is empty. Add application-local.properties in backend-java folder with spring.mail.username and spring.mail.password (Gmail App Password).");
        } else {
            System.out.println("[Newsletter] Mail configured for: " + mailFrom + " — verification emails will be sent.");
        }
    }

    /**
     * Sends a verification code to the email. If email could not be sent (no mail config or send failed),
     * returns the code so the frontend can show it for testing (e.g. on phone without email access).
     */
    public Optional<String> sendCode(String email) {
        String normalized = normalizeEmail(email);
        if (normalized == null || normalized.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        String domain = normalized.contains("@") ? normalized.substring(normalized.indexOf('@') + 1) : "";
        if (!EmailValidation.domainHasMxRecords(domain)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "This email domain doesn't accept mail. Please use a valid email address (e.g. Gmail, Outlook).");
        }

        String code = generateCode();
        Date expiry = new Date(System.currentTimeMillis() + CODE_EXPIRY_MINUTES * 60 * 1000L);
        pendingCodes.put(normalized, new PendingCode(code, expiry));

        String from = (newsletterFromOverride != null && !newsletterFromOverride.isBlank())
                ? newsletterFromOverride
                : (mailFrom != null && !mailFrom.isBlank() ? mailFrom : "noreply@giftmart.com");

        boolean sent = false;
        if (mailSender != null) {
            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setFrom(from);
                msg.setTo(normalized);
                msg.setSubject("Your Gift Mart verification code");
                msg.setText("Your verification code is: " + code + "\n\nIt expires in " + CODE_EXPIRY_MINUTES + " minutes.\n\n— Gift Mart");
                mailSender.send(msg);
                sent = true;
            } catch (Exception e) {
                System.err.println("[Newsletter] Could not send email to " + normalized + ": " + e.getMessage());
                e.printStackTrace(System.err);
                System.err.println("[Newsletter] Verification code for " + normalized + ": " + code);
            }
        } else {
            System.out.println("[Newsletter] Verification code for " + normalized + ": " + code);
        }
        // Return code only when email was not sent, so frontend can show it (e.g. testing on phone)
        return sent ? Optional.empty() : Optional.of(code);
    }

    public void verify(String email, String code) {
        String normalized = normalizeEmail(email);
        if (normalized == null || normalized.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (code == null || code.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification code is required");
        }

        String trimmedCode = code.trim().replaceAll("\\s+", "");
        PendingCode pending = pendingCodes.get(normalized);
        if (pending == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired code. Please request a new code.");
        }
        if (pending.expiry.before(new Date())) {
            pendingCodes.remove(normalized);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code has expired. Please request a new code.");
        }
        if (!pending.code.equals(trimmedCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid code. Please try again.");
        }

        pendingCodes.remove(normalized);

        if (subscriberRepository.existsByEmail(normalized)) {
            return; // already subscribed, still success
        }

        NewsletterSubscriber sub = new NewsletterSubscriber();
        sub.setEmail(normalized);
        sub.setSubscribedAt(new Date());
        subscriberRepository.save(sub);
    }

    private static String normalizeEmail(String email) {
        return email == null ? null : email.toLowerCase().trim();
    }

    private static String generateCode() {
        Random r = new Random();
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(r.nextInt(10));
        }
        return sb.toString();
    }

    private static class PendingCode {
        final String code;
        final Date expiry;

        PendingCode(String code, Date expiry) {
            this.code = code;
            this.expiry = expiry;
        }
    }
}
