package com.placeit.placement.repository;

import com.placeit.placement.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByJobId(Long jobId);
    List<JobApplication> findByStudentId(Long studentId);
    boolean existsByJobIdAndStudentId(Long jobId, Long studentId);
    long countByStatus(JobApplication.ApplicationStatus status);
}
