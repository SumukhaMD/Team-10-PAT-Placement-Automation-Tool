package com.placement.student.service;

import com.placement.student.dto.EducationDto;
import com.placement.student.dto.StudentProfileDto;
import com.placement.student.entity.Education;
import com.placement.student.entity.Student;
import com.placement.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentService {

    private final StudentRepository repo;

    // 🔥 COMMON METHOD → Create student if not exists
    private Student getOrCreateStudent(Long userId) {

        return repo.findByUserId(userId)
                .orElseGet(() -> {
                    log.warn("Creating student profile for userId: {}", userId);

                    Student s = new Student();

                    s.setUserId(userId);
                    s.setRollNumber("TEMP-" + userId);
                    s.setName("New Student");
                    s.setEmail("user" + userId + "@mail.com");
                    s.setBranch("CSE");
                    s.setGraduationYear(2026);
                    s.setCgpa(0.0);
                    s.setIsPlaced(false);

                    s.setSkills(new java.util.ArrayList<>());
                    s.setEducations(new java.util.ArrayList<>());

                    return repo.save(s);
                });
    }

    // ================= PROFILE =================

    public StudentProfileDto getProfile(Long userId) {
        log.info("GET PROFILE CALLED for userId: {}", userId);

        Student s = getOrCreateStudent(userId);
        return toDto(s);
    }

    @Transactional
    public StudentProfileDto updateProfile(Long userId, StudentProfileDto dto) {
        Student s = getOrCreateStudent(userId);

        if (dto.getName() != null) s.setName(dto.getName());
        if (dto.getPhoneNumber() != null) s.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getBio() != null) s.setBio(dto.getBio());
        if (dto.getBranch() != null) s.setBranch(dto.getBranch());
        if (dto.getCgpa() != null) s.setCgpa(dto.getCgpa());
        if (dto.getSkills() != null) s.setSkills(dto.getSkills());
        if (dto.getLinkedinUrl() != null) s.setLinkedinUrl(dto.getLinkedinUrl());
        if (dto.getGithubUrl() != null) s.setGithubUrl(dto.getGithubUrl());
        if (dto.getRollNumber() != null) s.setRollNumber(dto.getRollNumber());
        if (dto.getEmail() != null) s.setEmail(dto.getEmail());
        if (dto.getGraduationYear() != null) s.setGraduationYear(dto.getGraduationYear());
        if (dto.getGender() != null) s.setGender(dto.getGender());

        return toDto(repo.save(s));
    }

    // ================= EDUCATION =================

    @Transactional
    public StudentProfileDto addEducation(Long userId, EducationDto dto) {
        Student s = getOrCreateStudent(userId);

        Education edu = Education.builder()
                .student(s)
                .institutionName(dto.getInstitutionName())
                .degree(dto.getDegree())
                .fieldOfStudy(dto.getFieldOfStudy())
                .startYear(dto.getStartYear())
                .endYear(dto.getEndYear())
                .percentage(dto.getPercentage())
                .grade(dto.getGrade())
                .build();

        s.getEducations().add(edu);
        return toDto(repo.save(s));
    }

    // ================= SKILLS =================

    @Transactional
    public StudentProfileDto addSkills(Long userId, List<String> skills) {
        Student s = getOrCreateStudent(userId);

        s.getSkills().addAll(skills);
        return toDto(repo.save(s));
    }

    // ================= RESUME =================

    public String uploadResume(Long userId, MultipartFile file) {
        Student s = getOrCreateStudent(userId);

        String url = "/uploads/resumes/" + userId + "_" + file.getOriginalFilename();
        s.setResumeUrl(url);

        repo.save(s);

        log.info("Resume uploaded for userId {}: {}", userId, url);
        return url;
    }

    // ================= ADMIN =================

    public List<StudentProfileDto> getAll() {
        return repo.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public long getStudentCount() {
        return repo.count();
    }

    public long getPlacedCount() {
        return repo.findByIsPlaced(true).size();
    }

    // ================= MAPPER =================

    private StudentProfileDto toDto(Student s) {
        List<EducationDto> eduDtos = s.getEducations() != null
                ? s.getEducations().stream().map(e -> EducationDto.builder()
                .id(e.getId())
                .institutionName(e.getInstitutionName())
                .degree(e.getDegree())
                .fieldOfStudy(e.getFieldOfStudy())
                .startYear(e.getStartYear())
                .endYear(e.getEndYear())
                .percentage(e.getPercentage())
                .grade(e.getGrade())
                .build()).collect(Collectors.toList())
                : List.of();

        return StudentProfileDto.builder()
                .id(s.getId())
                .userId(s.getUserId())
                .rollNumber(s.getRollNumber())
                .name(s.getName())
                .email(s.getEmail())
                .phoneNumber(s.getPhoneNumber())
                .bio(s.getBio())
                .branch(s.getBranch())
                .graduationYear(s.getGraduationYear())
                .cgpa(s.getCgpa())
                .gender(s.getGender())
                .skills(s.getSkills())
                .resumeUrl(s.getResumeUrl())
                .linkedinUrl(s.getLinkedinUrl())
                .githubUrl(s.getGithubUrl())
                .isPlaced(s.getIsPlaced())
                .educations(eduDtos)
                .build();
    }
}