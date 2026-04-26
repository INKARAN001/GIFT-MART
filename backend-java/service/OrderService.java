package com.giftmart.service;

import com.giftmart.document.Cart;
import com.giftmart.document.Order;
import com.giftmart.document.Product;
import com.giftmart.document.User;
import com.giftmart.repository.CartRepository;
import com.giftmart.repository.OrderRepository;
import com.giftmart.repository.ProductRepository;
import com.giftmart.repository.UserRepository;
import com.giftmart.util.CheckoutPricing;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final StripePaymentService stripePaymentService;
    private final GoogleMapsRouteService googleMapsRouteService;

    public OrderService(CartRepository cartRepository,
                        ProductRepository productRepository,
                        OrderRepository orderRepository,
                        UserRepository userRepository,
                        StripePaymentService stripePaymentService,
                        GoogleMapsRouteService googleMapsRouteService) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.stripePaymentService = stripePaymentService;
        this.googleMapsRouteService = googleMapsRouteService;
    }

    /** Cart subtotal in LKR (product lines only). */
    public double computeCartTotal(User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        Cart cart = cartRepository.findByUserId(user.getId()).orElse(null);
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            return 0;
        }
        double total = 0;
        for (Cart.CartLine line : cart.getItems()) {
            String pid = line.getProductId();
            if (pid == null || pid.isBlank()) {
                continue;
            }
            Optional<Product> opt = productRepository.findById(pid);
            if (opt.isEmpty() || !opt.get().isActive()) {
                continue;
            }
            Product p = opt.get();
            int qty = Math.max(1, line.getQuantity());
            if (p.getStock() < qty) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Not enough stock for: " + p.getName());
            }
            total += p.getPrice() * qty;
        }
        return total;
    }

    public Order placeOrder(User user, Map<String, Object> body) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        String idempotencyKey = body != null && body.get("idempotencyKey") != null
                ? body.get("idempotencyKey").toString().trim() : "";
        if (!idempotencyKey.isEmpty()) {
            Optional<Order> existing = orderRepository.findByUserIdAndIdempotencyKey(user.getId(), idempotencyKey);
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        String paymentMethodRaw = "card";
        if (body != null && body.get("paymentMethod") != null) {
            paymentMethodRaw = body.get("paymentMethod").toString();
        }
        String paymentMethod = normalizePaymentMethod(paymentMethodRaw);

        Order.ShippingAddress shipping = parseShipping(body);
        if (shipping == null || isBlank(shipping.getStreet()) || isBlank(shipping.getCity())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Shipping street and city are required");
        }
        if (isBlank(shipping.getDistrict()) || isBlank(shipping.getState())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "District and province are required");
        }

        String stripePaymentIntentId = null;
        if (body != null) {
            if (body.get("stripePaymentIntentId") != null) {
                stripePaymentIntentId = body.get("stripePaymentIntentId").toString().trim();
            } else if (body.get("paymentIntentId") != null) {
                stripePaymentIntentId = body.get("paymentIntentId").toString().trim();
            }
        }
        if (stripePaymentIntentId != null && !stripePaymentIntentId.isEmpty()) {
            Optional<Order> paidOrder = orderRepository.findByStripePaymentIntentId(stripePaymentIntentId);
            if (paidOrder.isPresent()) {
                Order existing = paidOrder.get();
                if (!user.getId().equals(existing.getUserId())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "This payment is already linked to an order.");
                }
                log.info("Order already exists for PaymentIntent {} (user {}) — idempotent return",
                        stripePaymentIntentId, user.getId());
                return existing;
            }
        }

        Cart cart = cartRepository.findByUserId(user.getId()).orElse(null);
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        List<Cart.CartLine> lines = cart.getItems();
        List<Product> toSave = new ArrayList<>();
        List<Order.OrderLine> orderLines = new ArrayList<>();
        double productSubtotal = 0;

        for (Cart.CartLine line : lines) {
            String pid = line.getProductId();
            if (pid == null || pid.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart line missing product id");
            }
            Optional<Product> opt = productRepository.findById(pid);
            if (opt.isEmpty() || !opt.get().isActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Product no longer available: " + pid);
            }
            Product p = opt.get();
            int qty = line.getQuantity();
            if (qty < 1) {
                qty = 1;
            }
            if (p.getStock() < qty) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Not enough stock for: " + p.getName());
            }
            double lineTotal = p.getPrice() * qty;
            productSubtotal += lineTotal;

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

        ResolvedDelivery resolved = googleMapsRouteService.resolveDelivery(body);
        double merchandiseFee = CheckoutPricing.merchandiseFee(productSubtotal);
        double shippingFee = CheckoutPricing.shippingFeeForDelivery(resolved);
        double grandTotalLkr = productSubtotal + merchandiseFee + shippingFee;

        if (!stripePaymentService.isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Card payments are not configured. Set stripe.secret.key (Stripe secret key).");
        }
        long amountMinor = stripePaymentService.computeChargeAmountMinorFromLkr(grandTotalLkr);
        if (stripePaymentIntentId == null || stripePaymentIntentId.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "stripePaymentIntentId is required after completing card payment.");
        }

        log.info("Placing order for user {} PaymentIntent {}", user.getId(), stripePaymentIntentId);
        stripePaymentService.assertPaymentIntentSucceeded(stripePaymentIntentId, amountMinor);

        Date now = new Date();
        Order order = new Order();
        order.setUserId(user.getId());
        order.setItems(orderLines);
        order.setSubtotal(productSubtotal);
        order.setMerchandiseFee(merchandiseFee);
        order.setShippingFee(shippingFee);
        order.setDistanceKm(Math.round(resolved.distanceKm() * 10.0) / 10.0);
        order.setDeliveryLat(resolved.destLat());
        order.setDeliveryLng(resolved.destLng());
        order.setTotal(grandTotalLkr);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus("paid");
        order.setStatus("confirmed");
        order.setCreatedAt(now);
        order.setShippingAddress(shipping);
        order.setDeliveryStatus("processing");
        order.setTrackingNumber("GM-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase());
        order.setDeliveryUpdatedAt(now);
        if (!idempotencyKey.isEmpty()) {
            order.setIdempotencyKey(idempotencyKey);
        }
        if (stripePaymentIntentId != null && !stripePaymentIntentId.isEmpty()) {
            order.setStripePaymentIntentId(stripePaymentIntentId);
        }

        orderRepository.save(order);

        log.info("ORDER_PLACED: PI={}, amountLkr={}, userId={}", stripePaymentIntentId, grandTotalLkr, user.getId());

        for (Product p : toSave) {
            productRepository.save(Objects.requireNonNull(p));
        }

        cart.getItems().clear();
        cart.setUpdatedAt(new Date());
        cartRepository.save(cart);

        return order;
    }

    private static Order.ShippingAddress parseShipping(Map<String, Object> body) {
        if (body == null || body.get("shippingAddress") == null) {
            return null;
        }
        Object raw = body.get("shippingAddress");
        if (!(raw instanceof Map<?, ?> map)) {
            return null;
        }
        Order.ShippingAddress a = new Order.ShippingAddress();
        Object s = map.get("street");
        Object c = map.get("city");
        Object dist = map.get("district");
        Object st = map.get("state");
        if (st == null) {
            st = map.get("province");
        }
        Object z = map.get("zip");
        Object co = map.get("country");
        if (s != null) {
            a.setStreet(s.toString().trim());
        }
        if (c != null) {
            a.setCity(c.toString().trim());
        }
        if (dist != null) {
            a.setDistrict(dist.toString().trim());
        }
        if (st != null) {
            a.setState(st.toString().trim());
        }
        if (z != null) {
            a.setZip(z.toString().trim());
        }
        if (co != null) {
            a.setCountry(co.toString().trim());
        }
        return a;
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private static String normalizePaymentMethod(String raw) {
        if (raw == null || raw.isBlank()) {
            return "card";
        }
        String s = raw.trim().toLowerCase();
        if ("card".equals(s)) {
            return "card";
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Only card payment is accepted. Cash on delivery is not available.");
    }

    public List<Order> listForUser(User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public Order getOrderForUser(User user, @NonNull String orderId) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return orderRepository.findById(orderId)
                .filter(o -> user.getId().equals(o.getUserId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    /**
     * Public lookup: order must exist and email must match the account that placed it (same response if not — privacy).
     */
    public Map<String, Object> trackOrderPublic(@NonNull String orderId, @NonNull String email) {
        String oid = orderId.trim();
        String em = email.trim().toLowerCase();
        if (oid.isEmpty() || em.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order ID and email are required");
        }
        Order o = orderRepository.findById(oid).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        User u = userRepository.findById(Objects.requireNonNull(o.getUserId())).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (u.getEmail() == null || !u.getEmail().trim().equalsIgnoreCase(em)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return toPublicOrderSummary(o);
    }

    private Map<String, Object> toPublicOrderSummary(Order o) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id", o.getId());
        m.put("createdAt", o.getCreatedAt());
        m.put("total", o.getTotal());
        m.put("deliveryStatus", o.getDeliveryStatus());
        m.put("trackingNumber", o.getTrackingNumber());
        m.put("paymentStatus", o.getPaymentStatus());
        m.put("status", o.getStatus());
        int n = o.getItems() != null ? o.getItems().size() : 0;
        m.put("itemsCount", n);
        if (o.getShippingAddress() != null) {
            Order.ShippingAddress a = o.getShippingAddress();
            m.put("shipToCity", a.getCity());
            m.put("shipToDistrict", a.getDistrict());
        }
        return m;
    }
}
