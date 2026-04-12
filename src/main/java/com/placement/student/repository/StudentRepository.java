package com.placement.student.repository;

import com.placement.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByEmail(String email);
    List<Student> findByBranch(String branch);
    List<Student> findByIsPlaced(Boolean isPlaced);
    List<Student> findByCgpaGreaterThanEqual(Double minCgpa);
}
