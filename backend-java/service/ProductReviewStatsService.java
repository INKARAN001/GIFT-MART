package com.giftmart.service;

import com.giftmart.document.Product;
import com.giftmart.document.Review;
import com.giftmart.repository.ProductRepository;
import com.giftmart.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ProductReviewStatsService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ProductReviewStatsService(ReviewRepository reviewRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    /** Recompute averageRating and reviewCount from approved reviews only. */
    public void refreshForProduct(String productId) {
        if (productId == null || productId.isBlank()) {
            return;
        }
        Product p = productRepository.findById(productId).orElse(null);
        if (p == null) {
            return;
        }
        List<Review> list = reviewRepository.findByProduct_IdOrderByCreatedAtDesc(productId);
        int count = 0;
        double sum = 0;
        for (Review r : list) {
            if (isApprovedForDisplay(r)) {
                count++;
                sum += r.getRating();
            }
        }
        p.setReviewCount(count);
        p.setAverageRating(count > 0 ? Math.round((sum / count) * 10.0) / 10.0 : 0);
        p.setUpdatedAt(new Date());
        productRepository.save(p);
    }

    private static boolean isApprovedForDisplay(Review r) {
        String m = r.getModerationStatus();
        return m == null || m.isBlank() || "approved".equalsIgnoreCase(m);
    }
}
