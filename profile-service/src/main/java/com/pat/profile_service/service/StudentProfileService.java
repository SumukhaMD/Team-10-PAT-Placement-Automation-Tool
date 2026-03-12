package com.pat.profile_service.service;

import com.pat.profile_service.model.StudentProfile;
import com.pat.profile_service.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentProfileService {

    private final StudentProfileRepository repository;

    public StudentProfileService(StudentProfileRepository repository) {
        this.repository = repository;
    }

    public StudentProfile createProfile(StudentProfile profile) {
        return repository.save(profile);
    }

    public List<StudentProfile> getAllProfiles() {
        return repository.findAll();
    }

    public StudentProfile getProfileByUsn(String usn) {
        return repository.findByUsn(usn)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

}