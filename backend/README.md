# GrameenCraft Spring Boot Backend

A professional, high-performance **Spring Boot 3** application configured to serve GrameenCraft APIs. Features full entity models for cultural e-commerce (Users, Artisans, Products, Orders), active simulated email OTP verification during registration, PostgreSQL database connectivity, and **Google Gemini API** integration for automated, poetic heritage storytelling.

---

## 🏗️ Folder Structure

The backend workspace is perfectly organized into highly maintainable modules:

```text
backend/
├── pom.xml                                     # Maven dependency configuration
├── README.md                                    # This guide
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── grameencraft/
        │           ├── GrameenCraftApplication.java # SpringBoot main entrance
        │           ├── controller/             # REST Endpoints
        │           │   ├── AuthController.java # Signup with OTP & Login
        │           │   ├── ProductController.java
        │           │   ├── ArtisanController.java
        │           │   ├── OrderController.java
        │           │   └── StorytellingController.java # Gemini API integration
        │           ├── dto/                    # API payloads / Data Transfer Objects
        │           │   ├── LoginRequest.java
        │           │   ├── SignupRequest.java
        │           │   ├── VerifyRequest.java
        │           │   └── StoryRequest.java
        │           ├── model/                  # JPA PostgreSQL Database Entities
        │           │   ├── User.java
        │           │   ├── Product.java
        │           │   ├── Artisan.java
        │           │   └── Order.java
        │           ├── repository/             # Spring Data JPA interfaces
        │           │   ├── UserRepository.java
        │           │   ├── ProductRepository.java
        │           │   ├── ArtisanRepository.java
        │           │   └── OrderRepository.java
        │           └── service/                # Business logic & APIs
        │               ├── AuthService.java    # Handles registration/OTP verify
        │               └── GeminiStorytellingService.java # Invokes Gemini API
        └── resources/
            └── application.properties          # Port, CORS, Gemini & PostgreSQL details
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Java JDK 17** or higher
- **Maven** (configured on path)
- **PostgreSQL** server running locally or in the cloud

### 2. Configure PostgreSQL
Create a database named `grameencraft` in your PostgreSQL instance:
```sql
CREATE DATABASE grameencraft;
```

Update `/src/main/resources/application.properties` with your secure credentials:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/grameencraft
spring.datasource.username=postgres
spring.datasource.password=your_secure_password
```

### 3. Run the Backend Server
Run the Maven target from the `backend/` folder:
```bash
# Clean, compile, and boot the application
mvn spring-boot:run
```
The server will start running on port `8080`.

---

## 🔒 Security & Verification Flow

1. **User Signup (`POST /api/auth/signup`)**:
   - Expects name, email, phone, address, district, role, and password.
   - Generates a custom 4-digit code and logs it to the terminal for simulation.
2. **User Verify (`POST /api/auth/verify`)**:
   - Takes email and the 4-digit OTP. Marks the account as `isVerified = true` in PostgreSQL.
3. **User Login (`POST /api/auth/login`)**:
   - Logs the user in safely, ensuring verification is completed first.

---

## 🌟 Google Gemini API Integration

The `StorytellingController` utilizes standard generative AI APIs. If the environment variable `GEMINI_API_KEY` is set, the backend will dynamically generate bespoke poetic descriptions for your crafts. If missing or disconnected, it gracefully falls back to highly-descriptive, traditional cultural stories for Bengali heritage crafts.
