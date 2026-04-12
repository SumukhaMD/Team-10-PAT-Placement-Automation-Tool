package com.placement.student.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EducationDto {
    private Long id;
    private String institutionName;
    private String degree;
    private String fieldOfStudy;
    private Integer startYear;
    private Integer endYear;
    private Double percentage;
    private String grade;
}
