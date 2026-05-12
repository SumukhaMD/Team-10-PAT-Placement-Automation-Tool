package com.placeit.placement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "job_postings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class JobPosting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "drive_id", nullable = true, columnDefinition = "BIGINT DEFAULT NULL")
    private Long driveId = null;

    @Column(nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    private JobType jobType;

    private String location;

    private Long salary;

    private String requirements;

    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.ACTIVE;

    private LocalDate deadline;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum JobType {
        FULL_TIME, INTERNSHIP, PART_TIME
    }

    public enum JobStatus {
        ACTIVE, CLOSED, ON_HOLD
    }
}
