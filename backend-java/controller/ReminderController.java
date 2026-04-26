package com.giftmart.controller;

import com.giftmart.document.Reminder;
import com.giftmart.document.User;
import com.giftmart.repository.ReminderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final ReminderRepository reminderRepository;

    public ReminderController(ReminderRepository reminderRepository) {
        this.reminderRepository = reminderRepository;
    }

    @GetMapping
    public ResponseEntity<List<Reminder>> listMine(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(reminderRepository.findByUserIdOrderByRemindAtAsc(user.getId()));
    }

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal User user,
                                    @RequestBody Map<String, Object> body) {
        if (user == null) return ResponseEntity.status(401).build();
        String title = body.get("title") != null ? body.get("title").toString().trim() : "";
        if (title.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "title is required"));
        }
        Date remindAt = parseDate(body.get("remindAt"));
        if (remindAt == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "remindAt is required (ISO date string)"));
        }
        Reminder r = new Reminder();
        r.setUserId(user.getId());
        r.setTitle(title);
        r.setMessage(body.get("message") != null ? body.get("message").toString() : null);
        r.setRemindAt(remindAt);
        r.setEmailDayBeforeSent(false);
        Reminder saved = reminderRepository.save(r);
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMine(@AuthenticationPrincipal User user,
                                        @PathVariable @NonNull String id,
                                        @RequestBody Map<String, Object> body) {
        if (user == null) return ResponseEntity.status(401).build();
        return reminderRepository.findById(id)
                .map(r -> {
                    if (!user.getId().equals(r.getUserId())) {
                        return ResponseEntity.status(403).build();
                    }
                    if (body.containsKey("title")) {
                        String t = body.get("title").toString().trim();
                        if (!t.isEmpty()) r.setTitle(t);
                    }
                    if (body.containsKey("message")) {
                        r.setMessage(body.get("message") != null ? body.get("message").toString() : null);
                    }
                    if (body.containsKey("remindAt")) {
                        Date d = parseDate(body.get("remindAt"));
                        if (d != null) {
                            r.setRemindAt(d);
                            r.setEmailDayBeforeSent(false);
                        }
                    }
                    r.setUpdatedAt(new Date());
                    return ResponseEntity.ok(reminderRepository.save(r));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMine(@AuthenticationPrincipal User user,
                                        @PathVariable @NonNull String id) {
        if (user == null) return ResponseEntity.status(401).build();
        Optional<Reminder> opt = reminderRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Reminder r = opt.get();
        if (!user.getId().equals(r.getUserId())) return ResponseEntity.status(403).build();
        reminderRepository.delete(r);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    private static Date parseDate(Object raw) {
        if (raw == null) return null;
        if (raw instanceof Date d) return d;
        if (raw instanceof Number n) return new Date(n.longValue());
        try {
            return Date.from(java.time.Instant.parse(raw.toString()));
        } catch (Exception e) {
            try {
                return new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm").parse(raw.toString());
            } catch (Exception e2) {
                return null;
            }
        }
    }
}
