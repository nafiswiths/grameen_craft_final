package com.grameencraft.service;

import com.grameencraft.dto.LoginRequest;
import com.grameencraft.dto.SignupRequest;
import com.grameencraft.dto.VerifyRequest;
import com.grameencraft.model.User;
import com.grameencraft.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(SignupRequest request) {
        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email address already registered");
        }

        // Generate simulated 4-digit OTP code
        String code = String.format("%04d", new Random().nextInt(10000));

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setDistrict(request.getDistrict());
        user.setRole(request.getRole());
        user.setPassword(request.getPassword()); // In a real production site, use password encoding like BCrypt!
        user.setVerified(false);
        user.setVerificationCode(code);

        // Save and simulate sending email
        User savedUser = userRepository.save(user);
        System.out.println("SIMULATION: Verification code " + code + " sent to email: " + request.getEmail());
        
        return savedUser;
    }

    public User verifyEmail(VerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
            throw new RuntimeException("User is already verified");
        }

        if (user.getVerificationCode().equals(request.getCode())) {
            user.setVerified(true);
            user.setVerificationCode(null);
            return userRepository.save(user);
        } else {
            throw new RuntimeException("Incorrect verification code");
        }
    }

    public User loginUser(LoginRequest request) {
        User user = userRepository.findByEmailAndRole(request.getEmail(), request.getRole())
                .orElseThrow(() -> new RuntimeException("No account found with this email & role"));

        if (!user.isVerified()) {
            throw new RuntimeException("Please verify your email before logging in. An OTP code was sent during signup.");
        }

        if (user.getPassword().equals(request.getPassword())) {
            return user;
        } else {
            throw new RuntimeException("Incorrect password");
        }
    }
}
