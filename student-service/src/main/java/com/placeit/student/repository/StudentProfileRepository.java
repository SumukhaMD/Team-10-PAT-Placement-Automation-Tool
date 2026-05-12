package com.placeit.student.repository;

import com.placeit.student.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    long countByPlacementStatus(StudentProfile.PlacementStatus status);
}
