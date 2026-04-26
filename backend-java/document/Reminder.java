package com.giftmart.document;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "reminders")
public class Reminder {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed(name = "userId_1")
    private String userId;

    private String title;
    private String message;
    private Date remindAt;
    /** Set true after we send the "day before" email so we do not send twice. */
    private Boolean emailDayBeforeSent;
    private Date createdAt;
    private Date updatedAt;

    public Reminder() {
        Date now = new Date();
        this.createdAt = now;
        this.updatedAt = now;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Date getRemindAt() {
        return remindAt;
    }

    public void setRemindAt(Date remindAt) {
        this.remindAt = remindAt;
    }

    public Boolean getEmailDayBeforeSent() {
        return emailDayBeforeSent;
    }

    public void setEmailDayBeforeSent(Boolean emailDayBeforeSent) {
        this.emailDayBeforeSent = emailDayBeforeSent;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
}
