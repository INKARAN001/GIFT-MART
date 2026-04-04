package com.giftmart.controller;

import com.giftmart.document.Category;
import com.giftmart.repository.CategoryRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Public category list for the storefront — stays in sync with admin CRUD.
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<Category>> listForStorefront() {
        return ResponseEntity.ok(categoryRepository.findAll(
                Sort.by(Sort.Order.asc("sortOrder"), Sort.Order.asc("name"))));
    }
}
