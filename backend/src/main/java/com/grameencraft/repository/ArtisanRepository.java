package com.grameencraft.repository;

import com.grameencraft.model.Artisan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtisanRepository extends JpaRepository<Artisan, String> {
    List<Artisan> findByDistrict(String district);
}
