package com.giftmart.service;

import com.giftmart.document.Order;
import com.giftmart.repository.OrderRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

/**
 * Simulates delivery progression for demo / tracking UI (not a real carrier API).
 */
@Component
public class OrderDeliveryScheduler {

    private static final long STAGE_MILLIS = 3L * 60 * 1000; // 3 minutes between stages

    private final OrderRepository orderRepository;

    public OrderDeliveryScheduler(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Scheduled(fixedDelayString = "${giftmart.delivery.poll-ms:60000}")
    public void advanceDeliveries() {
        Date now = new Date();
        List<Order> all = orderRepository.findAll();
        for (Order o : all) {
            if (o.getDeliveryStatus() == null || "delivered".equalsIgnoreCase(o.getDeliveryStatus())) {
                continue;
            }
            Date ref = o.getDeliveryUpdatedAt() != null ? o.getDeliveryUpdatedAt() : o.getCreatedAt();
            if (ref == null) {
                ref = now;
            }
            if (now.getTime() - ref.getTime() < STAGE_MILLIS) {
                continue;
            }
            String next = nextStatus(o.getDeliveryStatus());
            if (next != null && !next.equals(o.getDeliveryStatus())) {
                o.setDeliveryStatus(next);
                o.setDeliveryUpdatedAt(now);
                orderRepository.save(o);
            }
        }
    }

    private static String nextStatus(String current) {
        if (current == null || "processing".equalsIgnoreCase(current)) {
            return "shipped";
        }
        if ("shipped".equalsIgnoreCase(current)) {
            return "out_for_delivery";
        }
        if ("out_for_delivery".equalsIgnoreCase(current)) {
            return "delivered";
        }
        return null;
    }
}
