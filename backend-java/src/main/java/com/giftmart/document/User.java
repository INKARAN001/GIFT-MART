package com.giftmart.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

// User model - stores user info in mongodb
@Document(collection = "users")
public class User {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed(unique = true)
    private String email;
    private String password; // stored as bcrypt hash
    private String name;
    private String role = "user"; // user or admin
    private String phone; // user phone number
    private String avatar;
    private Address address;
    private Map<String, Integer> orderFrequency = new LinkedHashMap<>(); // tracks how many times user ordered each product
    private Date createdAt;
    private Date updatedAt;
    private String resetToken;       // password reset token (null if none)
    private Date resetTokenExpiry;   // when the token expires
    private Boolean emailVerified;   // null or true = verified (backward compat), false = must verify
    private String verificationCode; // 6-digit code sent on register
    private Date verificationCodeExpiry;

    public User() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    // inner class for user address
    public static class Address {
        private String street, city, state, zip, country;

        public String getStreet() {
            return street;
        }

        public void setStreet(String street) {
            this.street = street;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getState() {
            return state;
        }

        public void setState(String state) {
            this.state = state;
        }

        public String getZip() {
            return zip;
        }

        public void setZip(String zip) {
            this.zip = zip;
        }

        public String getCountry() {
            return country;
        }

        public void setCountry(String country) {
            this.country = country;
        }
    }

    // getters and setters

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
        this.email = email != null ? email.toLowerCase() : null;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public Map<String, Integer> getOrderFrequency() {
        return orderFrequency;
    }

    public void setOrderFrequency(Map<String, Integer> orderFrequency) {
        this.orderFrequency = orderFrequency != null ? orderFrequency : new LinkedHashMap<>();
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

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public Date getResetTokenExpiry() {
        return resetTokenExpiry;
    }

    public void setResetTokenExpiry(Date resetTokenExpiry) {
        this.resetTokenExpiry = resetTokenExpiry;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    /** true if verified or field missing (existing users before email verification was added) */
    public boolean isEmailVerified() {
        return emailVerified == null || Boolean.TRUE.equals(emailVerified);
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public Date getVerificationCodeExpiry() {
        return verificationCodeExpiry;
    }

    public void setVerificationCodeExpiry(Date verificationCodeExpiry) {
        this.verificationCodeExpiry = verificationCodeExpiry;
    }
}
