package com.giftmart.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Category document – stored in MongoDB "categories" collection.
 * Category name is stored as a plain String (no foreign keys needed in Mongo).
 */
@Document(collection = "categories")
public class Category {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String description;

    public Category() {}

    public Category(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public String getId()                        { return id; }
    public String getName()                      { return name; }
    public void   setName(String name)           { this.name = name; }
    public String getDescription()               { return description; }
    public void   setDescription(String desc)    { this.description = desc; }
}
