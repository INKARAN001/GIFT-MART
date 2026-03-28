package com.giftmart.repository;

import com.giftmart.document.Category;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

// Repository for Category documents (MongoDB)
public interface CategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findByName(String name);
    boolean existsByName(String name);
}
