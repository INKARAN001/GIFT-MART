package com.giftmart.config;

import com.giftmart.document.Category;
import com.giftmart.document.Product;
import com.giftmart.document.User;
import com.giftmart.repository.CategoryRepository;
import com.giftmart.repository.ProductRepository;
import com.giftmart.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

// this runs when the app starts and creates default data if database is empty
@Component
public class SeedRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    public SeedRunner(UserRepository userRepository, ProductRepository productRepository,
                      CategoryRepository categoryRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // create admin user if not exists
        if (userRepository.findByEmail("admin@giftmart.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@giftmart.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setName("Admin");
            admin.setRole("admin");
            userRepository.save(admin);
            System.out.println("Admin user created: admin@giftmart.com / admin123");
        }

        // default categories (names must match product.category strings)
        if (categoryRepository.count() == 0) {
            ArrayList<Category> categories = new ArrayList<>(4);
            categories.add(seedCategory("Flash Cards", "flash-cards", "Bright learning essentials", "Aesthetic", "Trending", 0));
            categories.add(seedCategory("Bouquet", "bouquets", "Hand-picked arrangements", "Hand-picked Elegance", "New", 1));
            categories.add(seedCategory("Frames", "frames", "Preserve your memories", "Preserve Your Memories", "Bestseller", 2));
            categories.add(seedCategory("Gift Box", "gift-boxes", "Ready-to-gift packaging", "Pre-curated Perfection", "Popular", 3));
            categoryRepository.saveAll(categories);
            System.out.println("Default categories created (synced with product filters).");
        }

        // Sample products only when the catalog is completely empty (first install).
        // Never delete existing rows — admin edits must persist across restarts.
        if (productRepository.count() == 0) {
            ArrayList<Product> products = new ArrayList<>(12);
            products.add(createProduct("Rose Bouquet", "Classic rose bouquet, perfect for any occasion.", "Bouquet", 3500,
                    50, false));
            products.add(createProduct("Mixed Flower Bouquet", "Fresh mixed seasonal flowers.", "Bouquet", 4500, 40, false));
            products.add(createProduct("Lily Bouquet", "Elegant lily bouquet.", "Bouquet", 4200, 30, false));
            products.add(createProduct("Birthday Flash Cards (Set of 10)", "Colourful birthday greeting flash cards.",
                    "Flash Cards", 450, 100, false));
            products.add(createProduct("Thank You Flash Cards (Set of 10)", "Thank you message flash cards.", "Flash Cards",
                    450, 80, false));
            products.add(createProduct("Congratulations Flash Cards (Set of 10)",
                    "Congratulations and well done flash cards.", "Flash Cards", 500, 60, false));
            products.add(createProduct("Classic Photo Frame (A4)", "Elegant A4 photo frame.", "Frames", 1200, 60, false));
            products.add(createProduct("Multi Photo Frame (3-in-1)", "Frame for three 4x6 photos.", "Frames", 1800, 45,
                    false));
            products.add(createProduct("Wooden Picture Frame", "Handcrafted wooden picture frame.", "Frames", 2200, 35,
                    false));
            products.add(createProduct("Small Gift Box", "Small gift box, ideal for jewellery or small treats.", "Gift Box",
                    350, 100, false));
            products.add(createProduct("Medium Gift Box", "Medium gift box for presents.", "Gift Box", 650, 80, false));
            products.add(createProduct("Premium Gift Box (Large)", "Large premium gift box.", "Gift Box", 1200, 50, false));
            productRepository.saveAll(products);
            System.out.println("Sample products created (Bouquet, Flash Cards, Frames, Gift Box).");
        } else {
            System.out.println("Products collection already has data — skipping sample product seed.");
        }
    }

    private static Category seedCategory(String name, String slug, String description, String tagline, String overlay,
                                         int sortOrder) {
        Category c = new Category();
        c.setName(name);
        c.setSlug(slug);
        c.setDescription(description);
        c.setTagline(tagline);
        c.setOverlay(overlay);
        c.setSortOrder(sortOrder);
        return c;
    }

    // helper method to create a product object
    private static Product createProduct(String name, String desc, String category, double price, int stock,
                                         boolean customizable) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(desc);
        p.setCategory(category);
        p.setPrice(price);
        p.setStock(stock);
        p.setCustomizable(customizable);
        return p;
    }
}
