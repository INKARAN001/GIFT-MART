package com.giftmart.service;

import com.giftmart.document.Reminder;
import com.giftmart.document.User;
import com.giftmart.repository.ReminderRepository;
import com.giftmart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * Sends each user an email on the calendar day before their reminder event (server timezone).
 */
@Service
public class ReminderNotificationService {

    private final ReminderRepository reminderRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    public ReminderNotificationService(ReminderRepository reminderRepository,
                                       UserRepository userRepository,
                                       @Autowired(required = false) JavaMailSender mailSender) {
        this.reminderRepository = reminderRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
    }

    /** Daily at 08:00 server time — notify about events happening tomorrow. */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDayBeforeEmails() {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate eventDay = LocalDate.now(zone).plusDays(1);
        ZonedDateTime start = eventDay.atStartOfDay(zone);
        ZonedDateTime end = eventDay.plusDays(1).atStartOfDay(zone);
        Date from = Date.from(start.toInstant());
        Date to = Date.from(end.toInstant());

        List<Reminder> pending = reminderRepository.findPendingDayBeforeEmail(from, to);
        if (pending.isEmpty()) {
            return;
        }

        String fromAddr = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : "noreply@giftmart.com";

        for (Reminder r : pending) {
            Optional<User> userOpt = userRepository.findById(r.getUserId());
            if (userOpt.isEmpty()) {
                continue;
            }
            User u = userOpt.get();
            String email = u.getEmail();
            if (email == null || email.isBlank()) {
                continue;
            }

            String when = formatEventWhen(r.getRemindAt(), zone);
            String subject = "Gift Mart — reminder: " + (r.getTitle() != null ? r.getTitle() : "Event");
            String body = buildBody(r.getTitle(), r.getMessage(), when);

            if (mailSender != null) {
                try {
                    SimpleMailMessage msg = new SimpleMailMessage();
                    msg.setFrom(fromAddr);
                    msg.setTo(email);
                    msg.setSubject(subject);
                    msg.setText(body);
                    mailSender.send(msg);
                    r.setEmailDayBeforeSent(true);
                    r.setUpdatedAt(new Date());
                    reminderRepository.save(r);
                } catch (Exception e) {
                    System.err.println("[ReminderMail] Failed for reminder " + r.getId() + ": " + e.getMessage());
                }
            } else {
                System.out.println("[ReminderMail] No JavaMailSender — would email " + email + ": " + subject);
            }
        }
    }

    private static String formatEventWhen(Date remindAt, ZoneId zone) {
        if (remindAt == null) {
            return "your scheduled time";
        }
        ZonedDateTime z = remindAt.toInstant().atZone(zone);
        return z.format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a", java.util.Locale.ENGLISH));
    }

    private static String buildBody(String title, String message, String when) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hi,\n\n");
        sb.append("This is a friendly reminder from Gift Mart.\n\n");
        sb.append("You have an event coming up tomorrow:\n");
        if (title != null && !title.isBlank()) {
            sb.append("• ").append(title.trim()).append('\n');
        }
        if (message != null && !message.isBlank()) {
            sb.append(message.trim()).append('\n');
        }
        sb.append("\nScheduled for: ").append(when).append('\n');
        sb.append("\n— Gift Mart\n");
        return sb.toString();
    }
}
