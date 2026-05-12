package com.placeit.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfileDTO {
    private Long userId;
    private String branch;
    private Double cgpa;
    private Integer graduationYear;
    private String bio;
    private String placementStatus;
    private List<String> skills;
    private String resumeUrl;
}
