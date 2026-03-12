package com.pat.profile_service.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String usn;

    private String name;

    private String email;

    private String branch;

    private Double cgpa;

    private String skills;

    private String resumeUrl;

}