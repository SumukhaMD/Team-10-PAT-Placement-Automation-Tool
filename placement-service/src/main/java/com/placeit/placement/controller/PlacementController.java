package com.placeit.placement.controller;

import com.placeit.placement.dto.JobApplicationDTO;
import com.placeit.placement.entity.JobPosting;
import com.placeit.placement.entity.PlacementDrive;
import com.placeit.placement.entity.Interview;
import com.placeit.placement.service.PlacementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/placements")
@RequiredArgsConstructor
@Tag(name = "Placements", description = "Placement and Job Application APIs")
public class PlacementController {

    private final PlacementService placementService;

    // === Job Application Endpoints ===
    @PostMapping("/applications/apply")
    @Operation(summary = "Apply for a job")
    public ResponseEntity<JobApplicationDTO> applyForJob(
            @RequestParam Long jobId,
            @RequestHeader("X-User-Id") Long studentId,
            @RequestBody JobApplicationDTO applicationDTO) {
        JobApplicationDTO created = placementService.applyForJob(jobId, studentId, applicationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/applications/{id}")
    @Operation(summary = "Get application details")
    public ResponseEntity<JobApplicationDTO> getApplication(@PathVariable Long id) {
        return ResponseEntity.ok(placementService.getApplication(id));
    }

    @GetMapping("/applications/student")
    @Operation(summary = "Get all applications for current student")
    public ResponseEntity<List<JobApplicationDTO>> getStudentApplications(
            @RequestHeader("X-User-Id") Long studentId) {
        return ResponseEntity.ok(placementService.getStudentApplications(studentId));
    }

    @GetMapping("/applications/job/{jobId}")
    @Operation(summary = "Get all applications for a job")
    public ResponseEntity<List<JobApplicationDTO>> getJobApplications(@PathVariable Long jobId) {
        return ResponseEntity.ok(placementService.getJobApplications(jobId));
    }

    @PatchMapping("/applications/{id}/status")
    @Operation(summary = "Update application status")
    public ResponseEntity<JobApplicationDTO> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(placementService.updateApplicationStatus(id, status));
    }

    @DeleteMapping("/applications/{id}")
    @Operation(summary = "Withdraw/Delete an application")
    public ResponseEntity<Void> withdrawApplication(@PathVariable Long id) {
        placementService.withdrawApplication(id);
        return ResponseEntity.noContent().build();
    }

    // === Job Posting Endpoints ===
    @GetMapping("/jobs")
    @Operation(summary = "List all job postings")
    public ResponseEntity<Page<JobPosting>> listJobPostings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long companyId) {
        Pageable pageable = PageRequest.of(page, size);
        
        Page<JobPosting> result;
        if (status != null && !status.isEmpty()) {
            result = placementService.listJobPostingsByStatus(status, pageable);
        } else if (companyId != null) {
            result = placementService.listJobPostingsByCompany(companyId, pageable);
        } else {
            result = placementService.listJobPostings(pageable);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/jobs")
    @Operation(summary = "Create a new job posting")
    public ResponseEntity<JobPosting> createJobPosting(@RequestBody JobPosting jobPosting) {
        JobPosting created = placementService.createJobPosting(jobPosting);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/jobs/{id}")
    @Operation(summary = "Get a single job posting")
    public ResponseEntity<JobPosting> getJobPosting(@PathVariable Long id) {
        return ResponseEntity.ok(placementService.getJobPosting(id));
    }

    @PutMapping("/jobs/{id}")
    @Operation(summary = "Update a job posting")
    public ResponseEntity<JobPosting> updateJobPosting(
            @PathVariable Long id,
            @RequestBody JobPosting updates) {
        JobPosting updated = placementService.updateJobPosting(id, updates);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/jobs/{id}")
    @Operation(summary = "Delete a job posting")
    public ResponseEntity<Void> deleteJobPosting(@PathVariable Long id) {
        placementService.deleteJobPosting(id);
        return ResponseEntity.noContent().build();
    }

    // === Placement Drive Endpoints ===
    @GetMapping("/drives")
    @Operation(summary = "List placement drives")
    public ResponseEntity<Page<PlacementDrive>> listPlacementDrives(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        Pageable pageable = PageRequest.of(page, size);
        
        Page<PlacementDrive> result;
        if (status != null && !status.isEmpty()) {
            result = placementService.listPlacementDrivesByStatus(status, pageable);
        } else {
            result = placementService.listPlacementDrives(pageable);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/drives")
    @Operation(summary = "Create a placement drive")
    public ResponseEntity<PlacementDrive> createPlacementDrive(@RequestBody PlacementDrive drive) {
        PlacementDrive created = placementService.createPlacementDrive(drive);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/drives/{id}")
    @Operation(summary = "Get a single drive")
    public ResponseEntity<PlacementDrive> getPlacementDrive(@PathVariable Long id) {
        return ResponseEntity.ok(placementService.getPlacementDrive(id));
    }

    @PutMapping("/drives/{id}")
    @Operation(summary = "Update a drive")
    public ResponseEntity<PlacementDrive> updatePlacementDrive(
            @PathVariable Long id,
            @RequestBody PlacementDrive updates) {
        PlacementDrive updated = placementService.updatePlacementDrive(id, updates);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/drives/{id}/status")
    @Operation(summary = "Update drive status")
    public ResponseEntity<PlacementDrive> updateDriveStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        PlacementDrive updated = placementService.updatePlacementDriveStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/drives/{id}")
    @Operation(summary = "Delete a placement drive")
    public ResponseEntity<Void> deletePlacementDrive(@PathVariable Long id) {
        placementService.deletePlacementDrive(id);
        return ResponseEntity.noContent().build();
    }

    // === Interview Endpoints ===
    @GetMapping("/interviews")
    @Operation(summary = "List interviews")
    public ResponseEntity<Page<Interview>> listInterviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long companyId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Interview> result;
        if ("STUDENT".equalsIgnoreCase(userRole) && userId != null) {
            result = placementService.listInterviewsByStudent(userId, pageable);
        } else if (companyId != null && status != null && !status.isEmpty()) {
            result = placementService.listInterviewsByCompanyAndStatus(companyId, status, pageable);
        } else if (companyId != null) {
            result = placementService.listInterviewsByCompany(companyId, pageable);
        } else if (status != null && !status.isEmpty()) {
            result = placementService.listInterviewsByStatus(status, pageable);
        } else {
            result = placementService.listInterviews(pageable);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/interviews")
    @Operation(summary = "Create an interview")
    public ResponseEntity<Interview> createInterview(@RequestBody Interview interview) {
        Interview created = placementService.createInterview(interview);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/interviews/{id}")
    @Operation(summary = "Get a single interview")
    public ResponseEntity<Interview> getInterview(@PathVariable Long id) {
        return ResponseEntity.ok(placementService.getInterview(id));
    }

    @PutMapping("/interviews/{id}")
    @Operation(summary = "Update an interview")
    public ResponseEntity<Interview> updateInterview(
            @PathVariable Long id,
            @RequestBody Interview updates) {
        Interview updated = placementService.updateInterview(id, updates);
        return ResponseEntity.ok(updated);
    }

    // === Analytics Endpoints ===
    @GetMapping("/analytics/dashboard")
    @Operation(summary = "Get dashboard analytics")
    public ResponseEntity<?> getDashboardAnalytics() {
        try {
            java.util.Map<String, Object> analytics = new java.util.HashMap<>();
            
            // Basic analytics counts
            long totalJobs = placementService.getTotalJobPostings();
            long totalApplications = placementService.getTotalApplications();
            long totalDrives = placementService.getTotalPlacementDrives();
            long totalInterviews = placementService.getTotalInterviews();
            
            analytics.put("total_jobs", totalJobs);
            analytics.put("total_applications", totalApplications);
            analytics.put("total_drives", totalDrives);
            analytics.put("total_interviews", totalInterviews);
            analytics.put("success", true);
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            java.util.Map<String, Object> error = new java.util.HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/analytics/companies")
    @Operation(summary = "Get companies analytics")
    public ResponseEntity<?> getCompaniesAnalytics() {
        try {
            java.util.Map<String, Object> analytics = new java.util.HashMap<>();
            analytics.put("total_companies", placementService.getTotalCompanies());
            analytics.put("success", true);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            java.util.Map<String, Object> error = new java.util.HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/analytics/placements")
    @Operation(summary = "Get placements analytics")
    public ResponseEntity<?> getPlacementsAnalytics() {
        try {
            java.util.Map<String, Object> analytics = new java.util.HashMap<>();
            analytics.put("total_placed", placementService.getTotalPlaced());
            analytics.put("total_unplaced", placementService.getTotalUnplaced());
            analytics.put("success", true);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            java.util.Map<String, Object> error = new java.util.HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
