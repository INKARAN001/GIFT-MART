package com.giftmart.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonProperty;

// Review model - stores feedback/reviews managed by admin
// Users cannot submit reviews in Sprint 1 — admin manages feedback only
@Document(collection = "reviews")
public class Review {

    @Id
    @JsonProperty("_id")
    private String id;

    @DBRef
    private User user; // who wrote the review (if applicable)

    @DBRef
    private Product product; // which product

    private int rating;    // 1 to 5 stars
    private String comment;
    private String userName;  // display name for the review
    private String userEmail; // display email for the review
    private Date createdAt;

    public Review() {
        this.createdAt = new Date();
    }

    // getters and setters

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
