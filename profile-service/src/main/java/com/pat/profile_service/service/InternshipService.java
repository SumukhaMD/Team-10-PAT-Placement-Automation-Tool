package com.pat.profile_service.service;

import com.pat.profile_service.model.Internship;
import com.pat.profile_service.repository.InternshipRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InternshipService {

    private final InternshipRepository repository;

    public InternshipService(InternshipRepository repository) {
        this.repository = repository;
    }

    public Internship addInternship(Internship internship) {
        return repository.save(internship);
    }

    public List<Internship> getAllInternships() {
        return repository.findAll();
    }

    public List<Internship> getByStudent(String usn) {
        return repository.findByStudentUsn(usn);
    }

}
