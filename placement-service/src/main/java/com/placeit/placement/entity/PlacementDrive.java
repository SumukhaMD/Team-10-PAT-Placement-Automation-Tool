package com.placeit.placement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "placement_drives")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class PlacementDrive {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    private DriveStatus status = DriveStatus.UPCOMING;

    private Integer totalPositions;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Double minimumCgpa;

    private String allowedBranches;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum DriveStatus {
        UPCOMING, ACTIVE, COMPLETED, CANCELLED
    }
}
