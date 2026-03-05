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

// handles product listing and product details (public endpoints)
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
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
            // filter by category
            products = productRepository.findByCategoryAndActiveTrue(category,
                    PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt")));
            total = productRepository.countByCategoryAndActiveTrue(category);
        } else {
            // get all active products
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

    // get all categories
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
