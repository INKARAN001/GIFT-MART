package com.giftmart.config;

import com.giftmart.document.Product;
import com.giftmart.document.User;
import com.giftmart.repository.ProductRepository;
import com.giftmart.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

// this runs when the app starts and creates default data if database is empty
@Component
public class SeedRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public SeedRunner(UserRepository userRepository, ProductRepository productRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
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

        // add sample products if they dont exist
        boolean hasOurProducts = productRepository.findAll().stream()
                .anyMatch(p -> "Rose Bouquet".equals(p.getName()));
        if (!hasOurProducts) {
            productRepository.deleteAll();
            List<Product> products = Arrays.asList(
                    createProduct("Rose Bouquet", "Classic rose bouquet, perfect for any occasion.", "Bouquet", 3500,
                            50, false),
                    createProduct("Mixed Flower Bouquet", "Fresh mixed seasonal flowers.", "Bouquet", 4500, 40, false),
                    createProduct("Lily Bouquet", "Elegant lily bouquet.", "Bouquet", 4200, 30, false),
                    createProduct("Birthday Flash Cards (Set of 10)", "Colourful birthday greeting flash cards.",
                            "Flash Cards", 450, 100, false),
                    createProduct("Thank You Flash Cards (Set of 10)", "Thank you message flash cards.", "Flash Cards",
                            450, 80, false),
                    createProduct("Congratulations Flash Cards (Set of 10)",
                            "Congratulations and well done flash cards.", "Flash Cards", 500, 60, false),
                    createProduct("Classic Photo Frame (A4)", "Elegant A4 photo frame.", "Frames", 1200, 60, false),
                    createProduct("Multi Photo Frame (3-in-1)", "Frame for three 4x6 photos.", "Frames", 1800, 45,
                            false),
                    createProduct("Wooden Picture Frame", "Handcrafted wooden picture frame.", "Frames", 2200, 35,
                            false),
                    createProduct("Small Gift Box", "Small gift box, ideal for jewellery or small treats.", "Gift Box",
                            350, 100, false),
                    createProduct("Medium Gift Box", "Medium gift box for presents.", "Gift Box", 650, 80, false),
                    createProduct("Premium Gift Box (Large)", "Large premium gift box.", "Gift Box", 1200, 50, false));
            productRepository.saveAll(products);
            System.out.println("Sample products created (Bouquet, Flash Cards, Frames, Gift Box).");
        }
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
