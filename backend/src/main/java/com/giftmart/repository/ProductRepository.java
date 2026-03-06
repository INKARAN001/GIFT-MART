package com.giftmart.repository;

import com.giftmart.document.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

// repository for products
public interface ProductRepository extends MongoRepository<Product, String> {

    // get active products with pagination
    List<Product> findByActiveTrue(Pageable pageable);

    // get active products filtered by category
    List<Product> findByCategoryAndActiveTrue(String category, Pageable pageable);

    // count active products
    long countByActiveTrue();

    // count active products in a category
    long countByCategoryAndActiveTrue(String category);

    // get all unique category names using mongodb aggregation
    @Aggregation(pipeline = {
            "{ '$match': { 'isActive': true } }",
            "{ '$group': { '_id': '$category' } }",
            "{ '$sort': { '_id': 1 } }"
    })
    List<String> findDistinctCategories();
}
