package com.giftmart.controller;

import com.giftmart.document.Reminder;
import com.giftmart.document.User;
import com.giftmart.repository.OrderRepository;
import com.giftmart.repository.ProductRepository;
import com.giftmart.repository.ReminderRepository;
import com.giftmart.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ReminderRepository reminderRepository;
    private final ProductRepository productRepository;

    public UserController(UserRepository userRepository, OrderRepository orderRepository,
            ReminderRepository reminderRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.reminderRepository = reminderRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return userRepository.findById(user.getId())
                .map(u -> {
                    u.setPassword(null);
                    return ResponseEntity.ok(u);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return userRepository.findById(user.getId())
                .map(u -> {
                    if (body.containsKey("name"))
                        u.setName((String) body.get("name"));
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
                    u.setPassword(null);
                    return ResponseEntity.ok(userRepository.save(u));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/orders")
    public ResponseEntity<List<?>> getOrders(@AuthenticationPrincipal User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(orderRepository.findByUser_IdOrderByCreatedAtDesc(user.getId()));
    }

    // get all reminders for the logged in user
    @GetMapping("/reminders")
    public ResponseEntity<List<Reminder>> getReminders(@AuthenticationPrincipal User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(reminderRepository.findByUser_IdOrderByDateAsc(user.getId()));
    }

    // create a new reminder (with photo, phone number etc)
    @PostMapping("/reminders")
    public ResponseEntity<Reminder> createReminder(@AuthenticationPrincipal User user, @RequestBody Reminder reminder) {
        if (user == null)
            return ResponseEntity.status(401).build();
        reminder.setUser(user);
        reminder.setId(null); // let mongodb generate id
        return ResponseEntity.status(201).body(reminderRepository.save(reminder));
    }

    // update an existing reminder - only updates fields that are sent
    @PutMapping("/reminders/{id}")
    public ResponseEntity<Reminder> updateReminder(@AuthenticationPrincipal User user, @PathVariable String id,
            @RequestBody Reminder body) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return reminderRepository.findById(id)
                .filter(r -> r.getUser() != null && r.getUser().getId().equals(user.getId()))
                .map(r -> {
                    // check each field and update if not null
                    if (body.getTitle() != null)
                        r.setTitle(body.getTitle());
                    if (body.getType() != null)
                        r.setType(body.getType());
                    if (body.getDate() != null)
                        r.setDate(body.getDate());
                    if (body.getReminderDaysBefore() > 0)
                        r.setReminderDaysBefore(body.getReminderDaysBefore());
                    if (body.getNotes() != null)
                        r.setNotes(body.getNotes());
                    if (body.getPhoto() != null)
                        r.setPhoto(body.getPhoto());
                    if (body.getPhoneNumber() != null)
                        r.setPhoneNumber(body.getPhoneNumber());
                    return ResponseEntity.ok(reminderRepository.save(r));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // delete a reminder by id
    @DeleteMapping("/reminders/{id}")
    public ResponseEntity<Map<String, String>> deleteReminder(@AuthenticationPrincipal User user,
            @PathVariable String id) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return reminderRepository.findById(id)
                .filter(r -> r.getUser() != null && r.getUser().getId().equals(user.getId()))
                .map(r -> {
                    reminderRepository.delete(r);
                    return ResponseEntity.ok(Map.of("message", "Deleted"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<?>> getSuggestions(@AuthenticationPrincipal User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        var of = user.getOrderFrequency();
        if (of == null || of.isEmpty()) {
            return ResponseEntity.ok(productRepository.findByActiveTrue(
                    org.springframework.data.domain.PageRequest.of(0, 8, org.springframework.data.domain.Sort
                            .by(org.springframework.data.domain.Sort.Direction.DESC, "averageRating"))));
        }
        var productIds = of.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(10)
                .map(Map.Entry::getKey)
                .toList();
        var products = productRepository.findAllById(productIds);
        var order = productIds.stream()
                .map(pid -> products.stream().filter(p -> p.getId().equals(pid)).findFirst().orElse(null))
                .filter(p -> p != null).toList();
        return ResponseEntity.ok(order);
    }
}
