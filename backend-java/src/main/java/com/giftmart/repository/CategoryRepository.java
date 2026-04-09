package com.giftmart.repository;

import com.giftmart.document.Category;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

// Repository for Category documents (MongoDB)
public interface CategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findByName(String name);

    Optional<Category> findBySlug(String slug);

    boolean existsByName(String name);

    boolean existsBySlug(String slug);
}
