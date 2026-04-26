package com.giftmart.repository;

import com.giftmart.document.NewsletterSubscriber;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface NewsletterSubscriberRepository extends MongoRepository<NewsletterSubscriber, String> {

    Optional<NewsletterSubscriber> findByEmail(String email);

    boolean existsByEmail(String email);
}
