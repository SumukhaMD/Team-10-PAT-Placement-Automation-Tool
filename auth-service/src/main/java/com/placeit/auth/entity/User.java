package com.placeit.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "role", nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "email_verified")
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name = "failed_attempts")
    @Builder.Default
    private Integer failedAttempts = 0;

    @Column(name = "account_locked")
    @Builder.Default
    private Boolean accountLocked = false;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum UserRole {
        STUDENT, RECRUITER, ADMIN, TPO
    }
}
