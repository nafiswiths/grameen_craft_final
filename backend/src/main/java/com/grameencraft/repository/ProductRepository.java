package com.grameencraft.repository;

import com.grameencraft.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
    List<Product> findByIsTrendingTrue();
    List<Product> findByArtisanId(String artisanId);
}
