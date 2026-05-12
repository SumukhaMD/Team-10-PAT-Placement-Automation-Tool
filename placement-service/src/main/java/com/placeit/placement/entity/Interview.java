package com.placeit.placement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "interviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long applicationId;

    @Column(nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private Long studentId;

    @Enumerated(EnumType.STRING)
    private InterviewType type;

    private LocalDateTime scheduledDate;

    private String meetingLink;

    private String feedback;

    @Enumerated(EnumType.STRING)
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum InterviewType {
        TECHNICAL, HR, BOTH, GROUP
    }

    public enum InterviewStatus {
        SCHEDULED, COMPLETED, RESCHEDULED, CANCELLED
    }
}
