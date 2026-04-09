package com.giftmart.repository;

import com.giftmart.document.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

// repository for users
public interface UserRepository extends MongoRepository<User, String> {

    // find user by email (for login)
    Optional<User> findByEmail(String email);

    // check if email already registered
    boolean existsByEmail(String email);

    // find users by role (e.g. "user" for customers, "admin" for admins)
    List<User> findByRole(String role, Sort sort);

    // count users by role (to get only customer count, not admin)
    long countByRole(String role);

    // find user by password reset token
    Optional<User> findByResetToken(String resetToken);
}
