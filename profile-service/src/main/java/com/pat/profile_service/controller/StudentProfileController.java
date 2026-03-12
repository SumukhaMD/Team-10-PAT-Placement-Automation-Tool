package com.pat.profile_service.controller;



import com.pat.profile_service.model.StudentProfile;
import com.pat.profile_service.service.StudentProfileService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
public class StudentProfileController {

    private final StudentProfileService service;

    public StudentProfileController(StudentProfileService service) {
        this.service = service;
    }

    @PostMapping
    public StudentProfile createProfile(@RequestBody StudentProfile profile) {
        return service.createProfile(profile);
    }

    @GetMapping
    public List<StudentProfile> getAllProfiles() {
        return service.getAllProfiles();
    }

    @GetMapping("/{usn}")
    public StudentProfile getProfile(@PathVariable String usn) {
        return service.getProfileByUsn(usn);
    }

}
