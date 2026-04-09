package com.giftmart.service;

import com.giftmart.document.Cart;
import com.giftmart.document.Order;
import com.giftmart.document.Product;
import com.giftmart.document.User;
import com.giftmart.repository.CartRepository;
import com.giftmart.repository.OrderRepository;
import com.giftmart.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public OrderService(CartRepository cartRepository,
                        ProductRepository productRepository,
                        OrderRepository orderRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    public Order placeOrder(User user, String paymentMethodRaw) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        String paymentMethod = normalizePaymentMethod(paymentMethodRaw);

        Cart cart = cartRepository.findByUserId(user.getId()).orElse(null);
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        List<Cart.CartLine> lines = cart.getItems();
        List<Product> toSave = new ArrayList<>();
        List<Order.OrderLine> orderLines = new ArrayList<>();
        double total = 0;

        for (Cart.CartLine line : lines) {
            Optional<Product> opt = productRepository.findById(line.getProductId());
            if (opt.isEmpty() || !opt.get().isActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Product no longer available: " + line.getProductId());
            }
            Product p = opt.get();
            int qty = line.getQuantity();
            if (qty < 1) qty = 1;
            if (p.getStock() < qty) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Not enough stock for: " + p.getName());
            }
            double lineTotal = p.getPrice() * qty;
            total += lineTotal;

            Order.OrderLine ol = new Order.OrderLine();
            ol.setProductId(p.getId());
            ol.setProductName(p.getName());
            ol.setImage(p.getImage());
            ol.setUnitPrice(p.getPrice());
            ol.setQuantity(qty);
            ol.setLineTotal(lineTotal);
            orderLines.add(ol);

            p.setStock(p.getStock() - qty);
            p.setUnitsSold(p.getUnitsSold() + qty);
            p.setUpdatedAt(new Date());
            toSave.add(p);
        }

        Order order = new Order();
        order.setUserId(user.getId());
        order.setItems(orderLines);
        order.setTotal(total);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus("card".equals(paymentMethod) ? "paid" : "pending");
        order.setStatus("confirmed");
        order.setCreatedAt(new Date());
        orderRepository.save(order);

        for (Product p : toSave) {
            productRepository.save(p);
        }

        cart.getItems().clear();
        cart.setUpdatedAt(new Date());
        cartRepository.save(cart);

        return order;
    }

    private static String normalizePaymentMethod(String raw) {
        if (raw == null || raw.isBlank()) {
            return "cod";
        }
        String s = raw.trim().toLowerCase();
        if ("card".equals(s) || "cod".equals(s)) {
            return s;
        }
        return "cod";
    }

    public List<Order> listForUser(User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }
}
