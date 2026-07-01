package com.grameencraft.controller;

import com.grameencraft.dto.LoginRequest;
import com.grameencraft.dto.SignupRequest;
import com.grameencraft.dto.VerifyRequest;
import com.grameencraft.model.User;
import com.grameencraft.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // CrossOrigin configured to allow easy connection with the React frontend
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        try {
            User user = authService.registerUser(request);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Signup initiated! Verification code sent to your email.");
            response.put("email", user.getEmail());
            // Included for debugging/simulation simplicity in the API response
            response.put("simulatedCode", user.getVerificationCode());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@Valid @RequestBody VerifyRequest request) {
        try {
            User verifiedUser = authService.verifyEmail(request);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Email verified successfully!");
            response.put("user", verifiedUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = authService.loginUser(request);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Logged in successfully!");
            response.put("user", user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(401).body(errorResponse);
        }
    }
}
