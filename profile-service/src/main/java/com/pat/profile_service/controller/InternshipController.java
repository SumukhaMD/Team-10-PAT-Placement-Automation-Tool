package com.pat.profile_service.controller;

import com.pat.profile_service.model.Internship;
import com.pat.profile_service.service.InternshipService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/internships")
public class InternshipController {

    private final InternshipService service;

    public InternshipController(InternshipService service) {
        this.service = service;
    }

    @PostMapping
    public Internship addInternship(@RequestBody Internship internship) {
        return service.addInternship(internship);
    }

    @GetMapping
    public List<Internship> getAllInternships() {
        return service.getAllInternships();
    }

    @GetMapping("/{usn}")
    public List<Internship> getInternshipsByStudent(@PathVariable String usn) {
        return service.getByStudent(usn);
    }

}