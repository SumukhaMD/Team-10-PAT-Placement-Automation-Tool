package com.placeit.auth.service;

import com.placeit.auth.dto.AuthResponse;
import com.placeit.auth.dto.RegisterRequest;
import com.placeit.auth.entity.OtpToken;
import com.placeit.auth.entity.RefreshToken;
import com.placeit.auth.entity.User;
import com.placeit.auth.exception.AuthException;
import com.placeit.auth.exception.UserAlreadyExistsException;
import com.placeit.auth.repository.OtpTokenRepository;
import com.placeit.auth.repository.RefreshTokenRepository;
import com.placeit.auth.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final OtpService otpService;
    private final RestTemplate restTemplate;

    private static final String STUDENT_SERVICE_INIT_URL =
            "http://student-service/students/profile/init";

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration attempt with existing email: {}", request.getEmail());
            throw new UserAlreadyExistsException("Email already registered. Please login.");
        }

        if (request.getRole().equalsIgnoreCase("ADMIN")) {
            throw new AuthException("Admin accounts cannot be self-registered. Contact your system administrator.");
        }
        if (request.getRole().equalsIgnoreCase("TPO")) {
            throw new AuthException("TPO accounts cannot be self-registered. Contact your administrator.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(User.UserRole.valueOf(request.getRole().toUpperCase()))
                .emailVerified(false)
                .failedAttempts(0)
                .accountLocked(false)
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {}", request.getEmail());

        // Notify student-service to create a default profile for STUDENT registrations.
        // Wrapped in try-catch: if student-service is down, registration still succeeds.
        if (user.getRole() == User.UserRole.STUDENT) {
            try {
                Map<String, Object> initPayload = new HashMap<>();
                initPayload.put("userId", user.getId());
                initPayload.put("name", user.getName());
                initPayload.put("email", user.getEmail());
                ResponseEntity<Map> initResponse = restTemplate.postForEntity(
                        STUDENT_SERVICE_INIT_URL, initPayload, Map.class);
                log.info("Student profile init response for userId={}: status={}",
                        user.getId(), initResponse.getStatusCode());
            } catch (Exception ex) {
                log.warn("Could not create student profile for userId={} (student-service may be down): {}",
                        user.getId(), ex.getMessage());
            }
        }

        String otp = otpService.generateOtp();
        OtpToken otpToken = OtpToken.builder()
                .email(request.getEmail())
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .build();

        otpTokenRepository.save(otpToken);
        emailService.sendOtpEmail(request.getEmail(), otp);
        log.info("OTP sent to: {}", request.getEmail());
    }

    public AuthResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("Invalid credentials"));

        // Auto-unlock if the lockout period has expired
        if (Boolean.TRUE.equals(user.getAccountLocked())
                && user.getLockedUntil() != null
                && LocalDateTime.now().isAfter(user.getLockedUntil())) {
            user.setAccountLocked(false);
            user.setLockedUntil(null);
            user.setFailedAttempts(0);
            userRepository.save(user);
            log.info("Account auto-unlocked for: {}", email);
        }

        if (Boolean.TRUE.equals(user.getAccountLocked())) {
            throw new AuthException("Account is locked. Too many failed attempts.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            int attempts = user.getFailedAttempts() != null ? user.getFailedAttempts() + 1 : 1;
            user.setFailedAttempts(attempts);
            if (attempts >= 10) {
                user.setAccountLocked(true);
                user.setLockedUntil(LocalDateTime.now().plusMinutes(15));
                log.warn("Account locked for 15 minutes after {} failed attempts: {}", attempts, email);
            }
            userRepository.save(user);
            throw new AuthException("Invalid credentials");
        }

        user.setFailedAttempts(0);
        user.setAccountLocked(false);
        user.setLockedUntil(null);
        userRepository.save(user);
        log.info("User logged in successfully: {}", email);

        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtExpiration / 1000)
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new AuthException("Invalid refresh token"));

        if (refreshToken.getRevoked() || refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            // Clean up the expired/revoked token
            refreshTokenRepository.deleteByUserId(refreshToken.getUserId());
            throw new AuthException("Refresh token expired or revoked");
        }

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new AuthException("User not found"));

        String newAccessToken = generateAccessToken(user);
        // generateRefreshToken deletes all old tokens for this user before saving a new one
        String newRefreshToken = generateRefreshToken(user);

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(jwtExpiration / 1000)
                .build();
    }

    @Transactional
    public void verifyOtp(String email, String otp) {
        OtpToken otpToken = otpTokenRepository.findByEmailAndOtpAndUsedFalse(email, otp)
                .orElseThrow(() -> new AuthException("Invalid OTP"));

        if (otpToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new AuthException("OTP expired");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("User not found"));

        user.setEmailVerified(true);
        userRepository.save(user);

        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        log.info("Email verified for: {}", email);
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("User not found"));

        otpTokenRepository.deleteByEmail(email);

        String otp = otpService.generateOtp();
        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .build();

        otpTokenRepository.save(otpToken);
        emailService.sendOtpEmail(email, otp);

        log.info("Password reset OTP sent to: {}", email);
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        OtpToken otpToken = otpTokenRepository.findByEmailAndOtpAndUsedFalse(email, otp)
                .orElseThrow(() -> new AuthException("Invalid OTP"));

        if (otpToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new AuthException("OTP expired");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFailedAttempts(0);
        user.setAccountLocked(false);  // unlock account on successful password reset
        userRepository.save(user);

        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        log.info("Password reset for: {}", email);
    }

    /**
     * Admin-only user creation path. Bypasses the ADMIN/TPO self-registration
     * guard and skips OTP — admin-created accounts are immediately verified.
     * Called exclusively from AuthController#adminCreateUser which enforces
     * the X-User-Role: ADMIN header check before delegating here.
     */
    @Transactional
    public void adminCreateUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(User.UserRole.valueOf(request.getRole().toUpperCase()))
                .emailVerified(true)   // admin-created accounts skip OTP verification
                .failedAttempts(0)
                .accountLocked(false)
                .build();

        userRepository.save(user);
        log.info("Admin created user: {} with role: {}", request.getEmail(), request.getRole());

        if (user.getRole() == User.UserRole.STUDENT) {
            try {
                Map<String, Object> initPayload = new HashMap<>();
                initPayload.put("userId", user.getId());
                initPayload.put("name", user.getName());
                initPayload.put("email", user.getEmail());
                ResponseEntity<Map> initResponse = restTemplate.postForEntity(
                        STUDENT_SERVICE_INIT_URL, initPayload, Map.class);
                log.info("Student profile init response for admin-created userId={}: status={}",
                        user.getId(), initResponse.getStatusCode());
            } catch (Exception ex) {
                log.warn("Could not create student profile for admin-created userId={}: {}",
                        user.getId(), ex.getMessage());
            }
        }
    }

    private String generateAccessToken(User user) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(key)
                .compact();
    }

    private String generateRefreshToken(User user) {
        // Delete any existing refresh tokens for this user before issuing a new one.
        // This enforces the one-active-token-per-user policy and prevents
        // SQLIntegrityConstraintViolationException on the UNIQUE(token) column.
        refreshTokenRepository.deleteByUserId(user.getId());

        // Use a cryptographically random UUID as the token value instead of a
        // re-signable JWT. A JWT issued within the same millisecond for the same
        // user would produce an identical byte sequence, violating the UNIQUE constraint.
        String token = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .userId(user.getId())
                .token(token)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        log.debug("New refresh token issued for userId={}", user.getId());
        return token;
    }
}
