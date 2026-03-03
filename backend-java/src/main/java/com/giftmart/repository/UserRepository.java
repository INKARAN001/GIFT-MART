package com.giftmart.repository;

import com.giftmart.document.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

// repository for users
public interface UserRepository extends MongoRepository<User, String> {

    // find user by email (for login)
    Optional<User> findByEmail(String email);

    // check if email already registered
    boolean existsByEmail(String email);
}
