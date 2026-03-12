package com.pat.profile_service.repository;

import com.pat.profile_service.model.Internship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InternshipRepository extends JpaRepository<Internship, Long> {

    List<Internship> findByStudentUsn(String studentUsn);

}
