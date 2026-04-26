package com.giftmart.document;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * Category — admin-managed. Product.category string must match {@link #name} for filtering.
 */
@Document(collection = "categories")
public class Category {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed(name = "name_1", unique = true)
    private String name;

    /** URL segment for /products/{slug} — unique */
    @Indexed(name = "slug_1", unique = true)
    private String slug;

    private String description;

    /** Optional hero image URL for home / marketing */
    private String image;

    private String tagline;
    private String overlay;

    @Field("sortOrder")
    private Integer sortOrder;

    public Category() {
        this.sortOrder = 0;
    }

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

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getOverlay() {
        return overlay;
    }

    public void setOverlay(String overlay) {
        this.overlay = overlay;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
