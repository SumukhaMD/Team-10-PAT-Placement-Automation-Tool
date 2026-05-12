package com.placeit.placement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplicationDTO {
    private Long id;
    private Long jobId;
    private Long studentId;
    private String status;
    private String resumeUrl;
    private String coverLetter;
}
