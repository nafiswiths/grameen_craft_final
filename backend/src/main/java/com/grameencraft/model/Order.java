package com.grameencraft.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;
    private String recipientName;
    private String recipientPhone;
    private String recipientAddress;
    private String recipientDistrict;
    private double totalAmount;
    private String paymentMethod; // "COD", "bKash", "Card"
    private String orderStatus; // "Pending", "Processing", "Shipped", "Delivered"
    private LocalDateTime orderDate;

    @Column(length = 2000)
    private String itemsJson; // Serialized cart items JSON representation for simple persistence
}
