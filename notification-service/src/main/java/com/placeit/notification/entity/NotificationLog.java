package com.placeit.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipientEmail;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "LONGTEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    private NotificationStatus status = NotificationStatus.PENDING;

    private String errorMessage;

    private LocalDateTime sentAt;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum NotificationType {
        OTP, APPLICATION_UPDATE, INTERVIEW, DRIVE, WELCOME, PASSWORD_RESET
    }

    public enum NotificationStatus {
        PENDING, SENT, FAILED, RETRY
    }
}
