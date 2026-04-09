package com.giftmart.document;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "newsletter_subscribers")
public class NewsletterSubscriber {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed(unique = true)
    private String email;
    private Date subscribedAt;

    public NewsletterSubscriber() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.toLowerCase().trim() : null;
    }

    public Date getSubscribedAt() {
        return subscribedAt;
    }

    public void setSubscribedAt(Date subscribedAt) {
        this.subscribedAt = subscribedAt;
    }
}
