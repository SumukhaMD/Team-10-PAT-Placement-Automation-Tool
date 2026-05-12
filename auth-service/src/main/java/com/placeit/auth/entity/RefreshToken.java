package com.placeit.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, unique = true)
    private String token;

    private LocalDateTime expiryDate;

    private Boolean revoked = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}
