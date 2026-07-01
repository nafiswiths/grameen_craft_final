package com.grameencraft.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nameEn;
    private String nameBn;
    private String category;
    private double price;
    private String image;
    private String artisanName;
    private String artisanDistrict;
    private String artisanId;
    private double rating;
    private int reviewsCount;
    private boolean isTrending;
    private boolean inStock;
    private int deliveryDays;

    @Column(length = 2000)
    private String descEn;

    @Column(length = 2000)
    private String descBn;

    @ElementCollection
    @CollectionTable(name = "product_materials_en", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "material")
    private List<String> materialsEn;

    @ElementCollection
    @CollectionTable(name = "product_materials_bn", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "material")
    private List<String> materialsBn;
}
