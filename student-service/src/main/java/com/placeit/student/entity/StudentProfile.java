package com.placeit.student.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "student_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {
    @Id
    private Long userId;

    @Column(nullable = false)
    private String branch;

    private Double cgpa;

    private Integer graduationYear;

    private String bio;

    @Enumerated(EnumType.STRING)
    private PlacementStatus placementStatus = PlacementStatus.NOT_PLACED;

    @ElementCollection
    @CollectionTable(name = "student_skills", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "skill")
    private List<String> skills;

    private String resumeUrl;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum PlacementStatus {
        PLACED, NOT_PLACED, OFFER_ACCEPTED, REJECTED
    }
}
