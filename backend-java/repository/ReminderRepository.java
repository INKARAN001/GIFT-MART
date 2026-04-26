package com.giftmart.repository;

import com.giftmart.document.Reminder;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Date;
import java.util.List;

public interface ReminderRepository extends MongoRepository<Reminder, String> {
    List<Reminder> findByUserIdOrderByRemindAtAsc(String userId);

    /** Reminders whose event falls on [startInclusive, endExclusive) and day-before email not sent yet. */
    @Query("{ 'remindAt': { $gte: ?0, $lt: ?1 }, 'emailDayBeforeSent': { $ne: true } }")
    List<Reminder> findPendingDayBeforeEmail(Date startInclusive, Date endExclusive);
}
