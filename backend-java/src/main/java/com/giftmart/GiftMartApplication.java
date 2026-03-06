package com.giftmart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// main class - this starts the spring boot application
@SpringBootApplication
public class GiftMartApplication {

    public static void main(String[] args) {
        SpringApplication.run(GiftMartApplication.class, args);
        System.out.println("Gift Mart application started!");
    }
}
