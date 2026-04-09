package com.giftmart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// main class - this starts the spring boot application
@SpringBootApplication
@EnableScheduling
public class GiftMartApplication {

    public static void main(String[] args) {
        SpringApplication.run(GiftMartApplication.class, args);
        System.out.println("Gift Mart application started!");
    }
}
