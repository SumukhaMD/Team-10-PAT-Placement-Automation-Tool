package com.placeit.placement.repository;

import com.placeit.placement.entity.Interview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    Page<Interview> findByStatus(Interview.InterviewStatus status, Pageable pageable);
    Page<Interview> findByStudentId(Long studentId, Pageable pageable);
    Page<Interview> findByCompanyId(Long companyId, Pageable pageable);
    Page<Interview> findByCompanyIdAndStatus(Long companyId, Interview.InterviewStatus status, Pageable pageable);
    Page<Interview> findByApplicationId(Long applicationId, Pageable pageable);
    List<Interview> findByStudentIdAndStatus(Long studentId, Interview.InterviewStatus status);
}
