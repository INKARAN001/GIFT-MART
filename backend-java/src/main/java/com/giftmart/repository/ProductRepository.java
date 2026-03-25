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

    // keyword search in name (active only)
    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String keyword, Pageable pageable);

    // keyword + category combined search (active only)
    List<Product> findByCategoryAndNameContainingIgnoreCaseAndActiveTrue(
            String category, String keyword, Pageable pageable);

    // count active products
    long countByActiveTrue();

    // count active products in a category
    long countByCategoryAndActiveTrue(String category);

    // count keyword matches
    long countByNameContainingIgnoreCaseAndActiveTrue(String keyword);

    // count keyword + category matches
    long countByCategoryAndNameContainingIgnoreCaseAndActiveTrue(String category, String keyword);

    // get all unique category names using mongodb aggregation
    @Aggregation(pipeline = {
            "{ '$match': { 'isActive': true } }",
            "{ '$group': { '_id': '$category' } }",
            "{ '$sort': { '_id': 1 } }"
    })
    List<String> findDistinctCategories();
}
