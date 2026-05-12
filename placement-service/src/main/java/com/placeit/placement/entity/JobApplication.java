package com.placeit.placement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long jobId;

    @Column(nullable = false)
    private Long studentId;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    private String resumeUrl;

    private String coverLetter;

    private LocalDateTime appliedAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum ApplicationStatus {
        APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, SELECTED, REJECTED
    }
}
