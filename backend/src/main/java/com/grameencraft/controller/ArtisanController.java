package com.grameencraft.controller;

import com.grameencraft.model.Artisan;
import com.grameencraft.repository.ArtisanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/artisans")
@CrossOrigin(origins = "*")
public class ArtisanController {

    @Autowired
    private ArtisanRepository artisanRepository;

    @GetMapping
    public ResponseEntity<List<Artisan>> getAllArtisans() {
        return ResponseEntity.ok(artisanRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getArtisanById(@PathVariable String id) {
        Optional<Artisan> artisan = artisanRepository.findById(id);
        if (artisan.isPresent()) {
            return ResponseEntity.ok(artisan.get());
        }
        return ResponseEntity.notFound().build();
    }
}
