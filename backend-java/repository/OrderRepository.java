package com.giftmart.repository;

import com.giftmart.document.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends MongoRepository<Order, String> {

    /** True if the user has a paid order that includes this product (any line item). */
    @Query(value = "{ 'userId': ?0, 'items.productId': ?1, 'paymentStatus': 'paid' }", exists = true)
    boolean existsPaidOrderContainingProduct(String userId, String productId);

    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Order> findByUserIdAndIdempotencyKey(String userId, String idempotencyKey);

    Optional<Order> findByStripePaymentIntentId(String stripePaymentIntentId);

    List<Order> findByDeliveryStatusNot(String deliveryStatus);
}
