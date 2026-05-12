package com.placeit.student.controller;

import com.placeit.student.dto.StudentProfileDTO;
import com.placeit.student.entity.StudentProfile;
import com.placeit.student.repository.StudentProfileRepository;
import com.placeit.student.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Students", description = "Student Profile APIs")
public class StudentController {

    private final StudentService studentService;
    private final StudentProfileRepository studentProfileRepository;
    private final RestTemplate restTemplate;

    private static final String AUTH_USERS_URL =
            "http://auth-service/auth/users?role=STUDENT";

    @GetMapping
    @Operation(summary = "List all students")
    public ResponseEntity<?> listStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int limit) {
        try {
            Pageable pageable = PageRequest.of(page, limit);
            org.springframework.data.domain.Page<StudentProfileDTO> result =
                    studentService.findAllStudents(pageable);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", result.getContent());
            response.put("total", result.getTotalElements());
            response.put("page", page);
            response.put("limit", limit);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Fallback endpoint: fetches STUDENT users directly from auth-service when
     * the local student_profiles table is empty (e.g. before profile init migration).
     * Frontend calls this at GET /api/students/users.
     */
    @GetMapping("/users")
    @Operation(summary = "List student users from auth-service (fallback)")
    public ResponseEntity<?> listStudentUsers() {
        try {
            ResponseEntity<Map<String, Object>> authResponse = restTemplate.exchange(
                    AUTH_USERS_URL,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> body = authResponse.getBody();
            if (body == null) {
                return ResponseEntity.ok(Map.of("success", true, "data", Collections.emptyList(), "total", 0));
            }
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            log.warn("Could not fetch users from auth-service: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "data", Collections.emptyList(),
                    "total", 0,
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * Internal init endpoint called by auth-service after a STUDENT registers.
     * Idempotent: does nothing if a profile already exists for this userId.
     */
    @PostMapping("/profile/init")
    @Operation(summary = "Initialize student profile (called by auth-service on registration)")
    public ResponseEntity<?> initProfile(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            if (!studentProfileRepository.existsById(userId)) {
                StudentProfile profile = StudentProfile.builder()
                        .userId(userId)
                        .branch("Not Set")
                        .placementStatus(StudentProfile.PlacementStatus.NOT_PLACED)
                        .build();
                studentProfileRepository.save(profile);
                log.info("Default student profile created for userId={}", userId);
            } else {
                log.debug("Student profile already exists for userId={}, skipping init", userId);
            }
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Failed to init student profile: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Returns aggregate counts: total, placed, notPlaced.
     * If the local profiles table is empty, falls back to auth-service user count.
     */
    @GetMapping("/count")
    @Operation(summary = "Get student count statistics")
    public ResponseEntity<?> getStudentCounts() {
        try {
            long total = studentProfileRepository.count();
            long placed = studentProfileRepository.countByPlacementStatus(StudentProfile.PlacementStatus.PLACED);
            long notPlaced = studentProfileRepository.countByPlacementStatus(StudentProfile.PlacementStatus.NOT_PLACED);

            // If profiles table is empty, fall back to auth-service user count
            if (total == 0) {
                try {
                    ResponseEntity<Map<String, Object>> authResponse = restTemplate.exchange(
                            AUTH_USERS_URL,
                            HttpMethod.GET,
                            null,
                            new ParameterizedTypeReference<Map<String, Object>>() {}
                    );
                    Map<String, Object> body = authResponse.getBody();
                    if (body != null && body.containsKey("total")) {
                        long authTotal = Long.parseLong(body.get("total").toString());
                        return ResponseEntity.ok(Map.of(
                                "success", true,
                                "total", authTotal,
                                "placed", 0L,
                                "notPlaced", authTotal,
                                "_source", "auth-fallback"
                        ));
                    }
                } catch (Exception ex) {
                    log.warn("Auth-service fallback for count failed: {}", ex.getMessage());
                }
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "total", total,
                    "placed", placed,
                    "notPlaced", notPlaced
            ));
        } catch (Exception e) {
            log.error("Failed to get student counts: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }


    @GetMapping("/profile")
    @Operation(summary = "Get student profile")
    public ResponseEntity<StudentProfileDTO> getProfile(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(studentService.getProfile(userId));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update student profile")
    public ResponseEntity<StudentProfileDTO> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody StudentProfileDTO profileDTO) {
        return ResponseEntity.ok(studentService.updateProfile(userId, profileDTO));
    }

    @PostMapping("/resume/upload")
    @Operation(summary = "Upload resume")
    public ResponseEntity<String> uploadResume(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam("file") MultipartFile file) throws IOException {
        String resumeUrl = studentService.uploadResume(userId, file);
        return ResponseEntity.ok(resumeUrl);
    }
}
