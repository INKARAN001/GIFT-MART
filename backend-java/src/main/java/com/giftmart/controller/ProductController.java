package com.giftmart.controller;

import com.giftmart.document.Product;
import com.giftmart.repository.ProductRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

// handles product listing and product details (public endpoints)
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final MongoTemplate mongoTemplate;

    public ProductController(ProductRepository productRepository, MongoTemplate mongoTemplate) {
        this.productRepository = productRepository;
        this.mongoTemplate = mongoTemplate;
    }

    // get all products with pagination and optional category filter
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {
        List<Product> products;
        long total;
        if (category != null && !category.isBlank()) {
            products = productRepository.findByCategoryAndActiveTrue(category,
                    PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt")));
            total = productRepository.countByCategoryAndActiveTrue(category);
        } else {
            products = productRepository.findByActiveTrue(
                    PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt")));
            total = productRepository.countByActiveTrue();
        }
        Map<String, Object> body = new HashMap<>();
        body.put("products", products);
        body.put("total", total);
        body.put("page", page);
        body.put("pages", (int) Math.ceil((double) total / limit));
        return ResponseEntity.ok(body);
    }

    // search products by keyword and/or category
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) Boolean customizable,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Query query = new Query();
        query.addCriteria(Criteria.where("isActive").is(true));

        if (categories != null && !categories.isEmpty()) {
            query.addCriteria(Criteria.where("category").in(categories));
        }

        if (customizable != null && customizable) {
            query.addCriteria(Criteria.where("isCustomizable").is(true));
        }

        if (maxPrice != null && maxPrice > 0) {
            query.addCriteria(Criteria.where("price").lte(maxPrice));
        }

        if (keyword != null && !keyword.trim().isEmpty()) {
            String regex = ".*" + keyword.trim() + ".*";
            Criteria keywordCriteria = new Criteria().orOperator(
                Criteria.where("name").regex(regex, "i"),
                Criteria.where("description").regex(regex, "i"),
                Criteria.where("category").regex(regex, "i")
            );
            query.addCriteria(keywordCriteria);
        }

        long total = mongoTemplate.count(query, Product.class);
        
        // Add pagination and sorting
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        query.with(pageable);
        
        List<Product> products = mongoTemplate.find(query, Product.class);

        Map<String, Object> body = new HashMap<>();
        body.put("content", products);
        body.put("totalElements", total);
        body.put("totalPages", (int) Math.ceil((double) total / size));
        body.put("number", page);
        return ResponseEntity.ok(body);
    }

    // get all categories (derived from products)
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(productRepository.findDistinctCategories());
    }

    // get single product by id
    @GetMapping("/{id}")
    public ResponseEntity<Product> getOne(@PathVariable String id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
