package com.grameencraft.controller;

import com.grameencraft.dto.StoryRequest;
import com.grameencraft.service.GeminiStorytellingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/heritage-story")
@CrossOrigin(origins = "*")
public class StorytellingController {

    @Autowired
    private GeminiStorytellingService storytellingService;

    @PostMapping
    public ResponseEntity<?> getStory(@Valid @RequestBody StoryRequest request) {
        try {
            String story = storytellingService.generateHeritageStory(request);
            Map<String, String> response = new HashMap<>();
            response.put("story", story);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
