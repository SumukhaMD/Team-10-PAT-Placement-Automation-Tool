package com.placement.student.dto;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentProfileDto {
    private Long id;
    private Long userId;
    private String rollNumber;
    private String name;
    private String email;
    private String phoneNumber;
    private String bio;
    private String branch;
    private Integer graduationYear;
    private Double cgpa;
    private String gender;
    private List<String> skills;
    private String resumeUrl;
    private String linkedinUrl;
    private String githubUrl;
    private Boolean isPlaced;
    private List<EducationDto> educations;
}
