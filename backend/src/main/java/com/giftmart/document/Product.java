package com.giftmart.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

// Product model - stores product info in mongodb
@Document(collection = "products")
public class Product {

    @Id
    @JsonProperty("_id")
    private String id;
    private String name;
    private String description;
    @Indexed
    private String category; // like Bouquet, Flash Cards, Frames, Gift Box
    private double price;
    private int stock; // how many left
    private String image; // main image url
    private List<String> images; // multiple images
    @Field("isCustomizable")
    private boolean customizable; // can user customize this product
    private List<CustomOption> customOptions; // what can be customized
    private double averageRating; // average star rating from reviews
    private int reviewCount;
    @Field("isActive")
    private boolean active = true; // false means product is deleted/hidden
    private Date createdAt;
    private Date updatedAt;

    public Product() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.customOptions = new ArrayList<>();
        this.images = new ArrayList<>();
    }

    // inner class for custom options (like color picker, text input etc)
    public static class CustomOption {
        private String type; // text, color, select
        private String label;
        private List<String> choices;
        private boolean required;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public List<String> getChoices() {
            return choices;
        }

        public void setChoices(List<String> choices) {
            this.choices = choices;
        }

        public boolean isRequired() {
            return required;
        }

        public void setRequired(boolean required) {
            this.required = required;
        }
    }

    // getters and setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public boolean isCustomizable() {
        return customizable;
    }

    public void setCustomizable(boolean customizable) {
        this.customizable = customizable;
    }

    public List<CustomOption> getCustomOptions() {
        return customOptions;
    }

    public void setCustomOptions(List<CustomOption> customOptions) {
        this.customOptions = customOptions;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(int reviewCount) {
        this.reviewCount = reviewCount;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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
