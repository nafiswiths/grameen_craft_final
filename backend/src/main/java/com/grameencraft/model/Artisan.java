package com.grameencraft.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "artisans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Artisan {

    @Id
    private String id; // e.g., "artisan-rahima"

    private String name;
    private String district;
    private String specialtyEn;
    private String specialtyBn;
    private String bioEn;
    private String bioBn;
    private String image;
    private double rating;
    private int experienceYears;

    @ElementCollection
    @CollectionTable(name = "artisan_crafts_list", joinColumns = @JoinColumn(name = "artisan_id"))
    @Column(name = "craft")
    private List<String> crafts;
}
