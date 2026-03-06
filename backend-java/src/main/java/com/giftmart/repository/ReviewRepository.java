package com.giftmart.repository;

import com.giftmart.document.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

// repository for reviews
public interface ReviewRepository extends MongoRepository<Review, String> {

    // get all reviews for a product sorted by newest first
    List<Review> findByProduct_IdOrderByCreatedAtDesc(String productId);

    // find a specific user's review for a product
    Optional<Review> findByProduct_IdAndUser_Id(String productId, String userId);

    // check if user already reviewed a product
    boolean existsByUser_IdAndProduct_Id(String userId, String productId);
}
