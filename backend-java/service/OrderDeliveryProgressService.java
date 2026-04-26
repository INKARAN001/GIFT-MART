package com.giftmart.service;

import com.giftmart.document.Order;
import com.giftmart.repository.OrderRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

/**
 * Simulates delivery pipeline so orders move processing → shipped → out_for_delivery → delivered
 * without an external carrier API (demo / MVP tracking).
 */
@Service
public class OrderDeliveryProgressService {

    private final OrderRepository orderRepository;

    public OrderDeliveryProgressService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Advances delivery stages using time since last update (demo-friendly intervals so tracking
     * is visible without waiting hours; adjust constants for production).
     */
    @Scheduled(fixedRate = 120_000)
    public void advanceDeliveries() {
        List<Order> open = orderRepository.findByDeliveryStatusNot("delivered");
        long now = System.currentTimeMillis();
        final long processingToShippedMs = 3L * 60_000;
        final long shippedToNextMs = 4L * 60_000;
        for (Order o : open) {
            if (o == null || o.getId() == null) {
                continue;
            }
            Date ref = o.getDeliveryUpdatedAt() != null ? o.getDeliveryUpdatedAt() : o.getCreatedAt();
            if (ref == null) {
                ref = new Date();
            }
            long ageMs = now - ref.getTime();
            String ds = o.getDeliveryStatus() != null ? o.getDeliveryStatus() : "processing";
            String next = null;
            if ("processing".equals(ds) && ageMs >= processingToShippedMs) {
                next = "shipped";
            } else if ("shipped".equals(ds) && ageMs >= shippedToNextMs) {
                next = "out_for_delivery";
            } else if ("out_for_delivery".equals(ds) && ageMs >= shippedToNextMs) {
                next = "delivered";
            }
            if (next != null) {
                o.setDeliveryStatus(next);
                o.setDeliveryUpdatedAt(new Date());
                orderRepository.save(o);
            }
        }
    }
}
