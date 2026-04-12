package com.placement.student.controller;

import com.placement.student.dto.EducationDto;
import com.placement.student.dto.StudentProfileDto;
import com.placement.student.service.StudentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class StudentController {

    private final StudentService service;

    // ✅ IMPROVED METHOD (supports header + query param)
    private Long extractUserId(HttpServletRequest request, Long userIdParam) {

        // 1️⃣ Try query param first
        if (userIdParam != null) {
            System.out.println("Using userId from query param: " + userIdParam);
            return userIdParam;
        }

        // 2️⃣ Fallback to header
        String userIdHeader = request.getHeader("X-User-Id");
        System.out.println("HEADER RECEIVED: " + userIdHeader);

        if (userIdHeader == null || userIdHeader.isEmpty()) {
            throw new RuntimeException("Missing X-User-Id header or userId param");
        }

        return Long.parseLong(userIdHeader);
    }

    // ================= PROFILE =================

    @GetMapping("/students/profile")
    public ResponseEntity<StudentProfileDto> getProfile(
            HttpServletRequest request,
            @RequestParam(required = false) Long userId) {

        Long finalUserId = extractUserId(request, userId);
        return ResponseEntity.ok(service.getProfile(finalUserId));
    }

    @PutMapping("/students/profile")
    public ResponseEntity<StudentProfileDto> updateProfile(
            HttpServletRequest request,
            @RequestParam(required = false) Long userId,
            @RequestBody StudentProfileDto dto) {

        Long finalUserId = extractUserId(request, userId);
        return ResponseEntity.ok(service.updateProfile(finalUserId, dto));
    }

    // ================= RESUME =================

    @PostMapping("/students/resume/upload")
    public ResponseEntity<Map<String, Object>> uploadResume(
            HttpServletRequest request,
            @RequestParam(required = false) Long userId,
            @RequestParam("file") MultipartFile file) {

        Long finalUserId = extractUserId(request, userId);
        String url = service.uploadResume(finalUserId, file);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "resumeUrl", url,
                "message", "Resume uploaded"
        ));
    }

    // ================= SKILLS =================

    @PostMapping("/students/skills")
    public ResponseEntity<StudentProfileDto> addSkills(
            HttpServletRequest request,
            @RequestParam(required = false) Long userId,
            @RequestBody List<String> skills) {

        Long finalUserId = extractUserId(request, userId);
        return ResponseEntity.ok(service.addSkills(finalUserId, skills));
    }

    // ================= EDUCATION =================

    @PostMapping("/students/education")
    public ResponseEntity<StudentProfileDto> addEducation(
            HttpServletRequest request,
            @RequestParam(required = false) Long userId,
            @RequestBody EducationDto dto) {

        Long finalUserId = extractUserId(request, userId);
        return ResponseEntity.ok(service.addEducation(finalUserId, dto));
    }

    // ================= ADMIN =================

    @GetMapping("/students/all")
    public ResponseEntity<List<StudentProfileDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/admin/students/count")
    public ResponseEntity<Map<String, Object>> getCount() {
        return ResponseEntity.ok(Map.of(
                "totalStudents", service.getStudentCount(),
                "placedStudents", service.getPlacedCount()
        ));
    }
}