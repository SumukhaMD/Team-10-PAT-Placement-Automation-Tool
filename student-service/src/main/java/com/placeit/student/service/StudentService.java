package com.placeit.student.service;

import com.placeit.student.dto.StudentProfileDTO;
import com.placeit.student.entity.StudentProfile;
import com.placeit.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentService {

    private final StudentProfileRepository studentProfileRepository;

    @Value("${file.upload.dir}")
    private String uploadDir;

    public org.springframework.data.domain.Page<StudentProfileDTO> findAllStudents(
            org.springframework.data.domain.Pageable pageable) {
        return studentProfileRepository.findAll(pageable).map(this::convertToDTO);
    }

    public StudentProfileDTO getProfile(Long userId) {
        return studentProfileRepository.findById(userId)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
    }

    public StudentProfileDTO updateProfile(Long userId, StudentProfileDTO profileDTO) {
        StudentProfile profile = studentProfileRepository.findById(userId)
                .orElseGet(() -> StudentProfile.builder().userId(userId).build());

        profile.setBranch(profileDTO.getBranch());
        profile.setCgpa(profileDTO.getCgpa());
        profile.setGraduationYear(profileDTO.getGraduationYear());
        profile.setBio(profileDTO.getBio());
        profile.setSkills(profileDTO.getSkills());

        StudentProfile saved = studentProfileRepository.save(profile);
        log.info("Student profile updated for userId: {}", userId);
        return convertToDTO(saved);
    }

    public String uploadResume(Long userId, MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String filePath = uploadDir + File.separator + fileName;

        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        file.transferTo(new File(filePath));

        StudentProfile profile = studentProfileRepository.findById(userId)
                .orElseGet(() -> StudentProfile.builder().userId(userId).build());
        profile.setResumeUrl("/resumes/" + fileName);
        studentProfileRepository.save(profile);

        log.info("Resume uploaded for userId: {}", userId);
        return "/resumes/" + fileName;
    }

    private StudentProfileDTO convertToDTO(StudentProfile profile) {
        return StudentProfileDTO.builder()
                .userId(profile.getUserId())
                .branch(profile.getBranch())
                .cgpa(profile.getCgpa())
                .graduationYear(profile.getGraduationYear())
                .bio(profile.getBio())
                .placementStatus(profile.getPlacementStatus().name())
                .skills(profile.getSkills())
                .resumeUrl(profile.getResumeUrl())
                .build();
    }
}
