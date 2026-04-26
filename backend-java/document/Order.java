package com.giftmart.document;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "orders")
public class Order {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed(name = "userId_1")
    private String userId;

    private List<OrderLine> items = new ArrayList<>();
    /** Sum of product line totals (before fees). */
    private double subtotal;
    /** 2% merchandise fee on subtotal. */
    private double merchandiseFee;
    /** Distance-based shipping from Jaffna hub. */
    private double shippingFee;
    /** Road (or fallback) distance in km from hub to delivery. */
    private Double distanceKm;
    private Double deliveryLat;
    private Double deliveryLng;
    /** Grand total charged (subtotal + merchandise + shipping). */
    private double total;
    /** e.g. card */
    private String paymentMethod;
    /** e.g. pending, paid */
    private String paymentStatus;
    /** e.g. confirmed */
    private String status;
    private Date createdAt;

    private ShippingAddress shippingAddress;
    /** processing → shipped → out_for_delivery → delivered */
    private String deliveryStatus;
    private String trackingNumber;
    private Date deliveryUpdatedAt;
    /** Client-supplied key to prevent duplicate orders on double-submit */
    @Indexed(name = "idempotencyKey_1")
    private String idempotencyKey;
    /** Stripe PaymentIntent id — unique when set (sparse: multiple unset allowed). */
    @Indexed(name = "stripePaymentIntentId_1", unique = true, sparse = true)
    private String stripePaymentIntentId;

    public Order() {
        this.createdAt = new Date();
        this.status = "confirmed";
        this.deliveryStatus = "processing";
    }

    public static class ShippingAddress {
        private String street;
        private String city;
        private String district;
        private String state;
        private String zip;
        private String country;

        public String getStreet() {
            return street;
        }

        public void setStreet(String street) {
            this.street = street;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getDistrict() {
            return district;
        }

        public void setDistrict(String district) {
            this.district = district;
        }

        public String getState() {
            return state;
        }

        public void setState(String state) {
            this.state = state;
        }

        public String getZip() {
            return zip;
        }

        public void setZip(String zip) {
            this.zip = zip;
        }

        public String getCountry() {
            return country;
        }

        public void setCountry(String country) {
            this.country = country;
        }
    }

    public static class OrderLine {
        private String productId;
        private String productName;
        private String image;
        private double unitPrice;
        private int quantity;
        private double lineTotal;

        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public String getImage() {
            return image;
        }

        public void setImage(String image) {
            this.image = image;
        }

        public double getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(double unitPrice) {
            this.unitPrice = unitPrice;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        public double getLineTotal() {
            return lineTotal;
        }

        public void setLineTotal(double lineTotal) {
            this.lineTotal = lineTotal;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<OrderLine> getItems() {
        return items;
    }

    public void setItems(List<OrderLine> items) {
        this.items = items != null ? items : new ArrayList<>();
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(double subtotal) {
        this.subtotal = subtotal;
    }

    public double getMerchandiseFee() {
        return merchandiseFee;
    }

    public void setMerchandiseFee(double merchandiseFee) {
        this.merchandiseFee = merchandiseFee;
    }

    public double getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(double shippingFee) {
        this.shippingFee = shippingFee;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Double getDeliveryLat() {
        return deliveryLat;
    }

    public void setDeliveryLat(Double deliveryLat) {
        this.deliveryLat = deliveryLat;
    }

    public Double getDeliveryLng() {
        return deliveryLng;
    }

    public void setDeliveryLng(Double deliveryLng) {
        this.deliveryLng = deliveryLng;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public ShippingAddress getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(ShippingAddress shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(String deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public Date getDeliveryUpdatedAt() {
        return deliveryUpdatedAt;
    }

    public void setDeliveryUpdatedAt(Date deliveryUpdatedAt) {
        this.deliveryUpdatedAt = deliveryUpdatedAt;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public String getStripePaymentIntentId() {
        return stripePaymentIntentId;
    }

    public void setStripePaymentIntentId(String stripePaymentIntentId) {
        this.stripePaymentIntentId = stripePaymentIntentId;
    }
}
