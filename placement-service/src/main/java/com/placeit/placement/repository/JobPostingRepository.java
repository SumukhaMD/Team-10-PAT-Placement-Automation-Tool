package com.placeit.placement.repository;

import com.placeit.placement.entity.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    Page<JobPosting> findByStatus(JobPosting.JobStatus status, Pageable pageable);
    Page<JobPosting> findByCompanyId(Long companyId, Pageable pageable);
    Page<JobPosting> findByDriveId(Long driveId, Pageable pageable);
    List<JobPosting> findByCompanyIdAndStatus(Long companyId, JobPosting.JobStatus status);
}
