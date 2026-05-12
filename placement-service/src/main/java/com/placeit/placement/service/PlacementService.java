package com.placeit.placement.service;

import com.placeit.placement.dto.JobApplicationDTO;
import com.placeit.placement.entity.JobApplication;
import com.placeit.placement.entity.JobPosting;
import com.placeit.placement.entity.PlacementDrive;
import com.placeit.placement.entity.Interview;
import com.placeit.placement.repository.JobApplicationRepository;
import com.placeit.placement.repository.JobPostingRepository;
import com.placeit.placement.repository.PlacementDriveRepository;
import com.placeit.placement.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlacementService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobPostingRepository jobPostingRepository;
    private final PlacementDriveRepository placementDriveRepository;
    private final InterviewRepository interviewRepository;
    private final NotificationClient notificationClient;
    private final RestTemplate restTemplate;

    // === Job Application Methods ===
    public JobApplicationDTO applyForJob(Long jobId, Long studentId, JobApplicationDTO applicationDTO) {
        if (jobApplicationRepository.existsByJobIdAndStudentId(jobId, studentId)) {
            throw new RuntimeException("You have already applied for this job");
        }

        JobApplication application = JobApplication.builder()
                .jobId(jobId)
                .studentId(studentId)
                .resumeUrl(applicationDTO.getResumeUrl())
                .coverLetter(applicationDTO.getCoverLetter())
                .status(JobApplication.ApplicationStatus.APPLIED)
                .build();

        JobApplication saved = jobApplicationRepository.save(application);
        log.info("Job application created for studentId: {}, jobId: {}", studentId, jobId);
        return convertToDTO(saved);
    }

    public JobApplicationDTO getApplication(Long applicationId) {
        return jobApplicationRepository.findById(applicationId)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public List<JobApplicationDTO> getStudentApplications(Long studentId) {
        return jobApplicationRepository.findByStudentId(studentId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<JobApplicationDTO> getJobApplications(Long jobId) {
        return jobApplicationRepository.findByJobId(jobId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public JobApplicationDTO updateApplicationStatus(Long applicationId, String status) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(JobApplication.ApplicationStatus.valueOf(status));
        application.setUpdatedAt(LocalDateTime.now());

        JobApplication updated = jobApplicationRepository.save(application);
        log.info("Application status updated: {}", applicationId);
        return convertToDTO(updated);
    }

    public void withdrawApplication(Long applicationId) {
        if (!jobApplicationRepository.existsById(applicationId)) {
            throw new RuntimeException("Application not found");
        }
        jobApplicationRepository.deleteById(applicationId);
        log.info("Application withdrawn/deleted: {}", applicationId);
    }

    // === Job Posting Methods ===
    public Page<JobPosting> listJobPostings(Pageable pageable) {
        return jobPostingRepository.findAll(pageable);
    }

    public Page<JobPosting> listJobPostingsByStatus(String status, Pageable pageable) {
        JobPosting.JobStatus jobStatus = JobPosting.JobStatus.valueOf(status);
        return jobPostingRepository.findByStatus(jobStatus, pageable);
    }

    public Page<JobPosting> listJobPostingsByCompany(Long companyId, Pageable pageable) {
        return jobPostingRepository.findByCompanyId(companyId, pageable);
    }

    public JobPosting createJobPosting(JobPosting jobPosting) {
        jobPosting.setCreatedAt(LocalDateTime.now());
        jobPosting.setUpdatedAt(LocalDateTime.now());
        JobPosting saved = jobPostingRepository.save(jobPosting);
        log.info("Job posting created: {}", saved.getId());
        return saved;
    }

    public JobPosting getJobPosting(Long id) {
        return jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found"));
    }

    public JobPosting updateJobPosting(Long id, JobPosting updates) {
        JobPosting existing = getJobPosting(id);
        existing.setTitle(updates.getTitle());
        existing.setDescription(updates.getDescription());
        existing.setJobType(updates.getJobType());
        existing.setLocation(updates.getLocation());
        existing.setSalary(updates.getSalary());
        existing.setRequirements(updates.getRequirements());
        existing.setStatus(updates.getStatus());
        existing.setUpdatedAt(LocalDateTime.now());
        JobPosting updated = jobPostingRepository.save(existing);
        log.info("Job posting updated: {}", id);
        return updated;
    }

    public void deleteJobPosting(Long id) {
        jobPostingRepository.deleteById(id);
        log.info("Job posting deleted: {}", id);
    }

    // === Placement Drive Methods ===
    public Page<PlacementDrive> listPlacementDrives(Pageable pageable) {
        return placementDriveRepository.findAll(pageable);
    }

    public Page<PlacementDrive> listPlacementDrivesByStatus(String status, Pageable pageable) {
        PlacementDrive.DriveStatus driveStatus = PlacementDrive.DriveStatus.valueOf(status);
        return placementDriveRepository.findByStatus(driveStatus, pageable);
    }

    public PlacementDrive createPlacementDrive(PlacementDrive drive) {
        drive.setCreatedAt(LocalDateTime.now());
        drive.setUpdatedAt(LocalDateTime.now());
        PlacementDrive saved = placementDriveRepository.save(drive);
        log.info("Placement drive created: {}", saved.getId());

        // Notify all students about the new placement drive
        try {
            String studentsUrl = "http://student-service/api/students?limit=1000";
            Map response = restTemplate.getForObject(studentsUrl, Map.class);
            if (response != null && response.containsKey("content")) {
                List<Map<String, Object>> students = (List<Map<String, Object>>) response.get("content");
                String subject = "New Placement Drive - " + saved.getTitle();
                String body = "Dear Student, a new placement drive '" + saved.getTitle() +
                        "' has been announced by " + saved.getCompanyId() +
                        ". Start date: " + saved.getStartDate() +
                        ". Login to PlaceIT portal to apply.";
                for (Map<String, Object> student : students) {
                    String email = (String) student.get("email");
                    if (email != null && !email.isBlank()) {
                        notificationClient.sendEmail(email, subject, body);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to notify students about new drive {}: {}", saved.getId(), e.getMessage());
        }

        return saved;
    }

    public PlacementDrive getPlacementDrive(Long id) {
        return placementDriveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Placement drive not found"));
    }

    public PlacementDrive updatePlacementDrive(Long id, PlacementDrive updates) {
        PlacementDrive existing = getPlacementDrive(id);
        existing.setTitle(updates.getTitle());
        existing.setDescription(updates.getDescription());
        existing.setStatus(updates.getStatus());
        existing.setTotalPositions(updates.getTotalPositions());
        existing.setStartDate(updates.getStartDate());
        existing.setEndDate(updates.getEndDate());
        existing.setMinimumCgpa(updates.getMinimumCgpa());
        existing.setAllowedBranches(updates.getAllowedBranches());
        existing.setUpdatedAt(LocalDateTime.now());
        PlacementDrive updated = placementDriveRepository.save(existing);
        log.info("Placement drive updated: {}", id);

        // Notify all students about the updated placement drive
        try {
            String studentsUrl = "http://student-service/api/students?limit=1000";
            Map response = restTemplate.getForObject(studentsUrl, Map.class);
            if (response != null && response.containsKey("content")) {
                List<Map<String, Object>> students = (List<Map<String, Object>>) response.get("content");
                String subject = "Placement Drive Updated - " + updated.getTitle();
                String body = "Dear Student, the placement drive '" + updated.getTitle() +
                        "' has been updated. New dates: " + updated.getStartDate() +
                        " to " + updated.getEndDate() +
                        ". Check the PlaceIT portal for more details.";
                for (Map<String, Object> student : students) {
                    String email = (String) student.get("email");
                    if (email != null && !email.isBlank()) {
                        notificationClient.sendEmail(email, subject, body);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to notify students about updated drive {}: {}", id, e.getMessage());
        }

        return updated;
    }

    public PlacementDrive updatePlacementDriveStatus(Long id, String status) {
        PlacementDrive existing = getPlacementDrive(id);
        existing.setStatus(PlacementDrive.DriveStatus.valueOf(status));
        existing.setUpdatedAt(LocalDateTime.now());
        PlacementDrive updated = placementDriveRepository.save(existing);
        log.info("Placement drive status updated to {}: {}", status, id);
        return updated;
    }

    public void deletePlacementDrive(Long id) {
        placementDriveRepository.deleteById(id);
        log.info("Placement drive deleted: {}", id);
    }

    // === Interview Methods ===
    public Page<Interview> listInterviews(Pageable pageable) {
        return interviewRepository.findAll(pageable);
    }

    public Page<Interview> listInterviewsByStatus(String status, Pageable pageable) {
        Interview.InterviewStatus interviewStatus = Interview.InterviewStatus.valueOf(status);
        return interviewRepository.findByStatus(interviewStatus, pageable);
    }

    public Page<Interview> listInterviewsByCompany(Long companyId, Pageable pageable) {
        return interviewRepository.findByCompanyId(companyId, pageable);
    }

    public Page<Interview> listInterviewsByCompanyAndStatus(Long companyId, String status, Pageable pageable) {
        Interview.InterviewStatus interviewStatus = Interview.InterviewStatus.valueOf(status);
        return interviewRepository.findByCompanyIdAndStatus(companyId, interviewStatus, pageable);
    }

    public Page<Interview> listInterviewsByStudent(Long studentId, Pageable pageable) {
        return interviewRepository.findByStudentId(studentId, pageable);
    }

    public Interview createInterview(Interview interview) {
        interview.setCreatedAt(LocalDateTime.now());
        interview.setUpdatedAt(LocalDateTime.now());
        Interview saved = interviewRepository.save(interview);
        log.info("Interview created: {}", saved.getId());

        // Notify the student about the scheduled interview
        try {
            String userUrl = "http://auth-service/api/auth/users/" + saved.getStudentId();
            Map userResponse = restTemplate.getForObject(userUrl, Map.class);
            if (userResponse != null) {
                String studentEmail = (String) userResponse.get("email");
                if (studentEmail != null && !studentEmail.isBlank()) {
                    String subject = "Interview Scheduled - PlaceIT";
                    String body = "Dear Student, your interview has been scheduled for " +
                            saved.getScheduledDate() +
                            ". Type: " + saved.getType() +
                            ". Meeting link: " + saved.getMeetingLink();
                    notificationClient.sendEmail(studentEmail, subject, body);
                }
            }
        } catch (Exception e) {
            log.error("Failed to notify student {} about interview {}: {}", saved.getStudentId(), saved.getId(), e.getMessage());
        }

        return saved;
    }

    public Interview getInterview(Long id) {
        return interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
    }

    public Interview updateInterview(Long id, Interview updates) {
        Interview existing = getInterview(id);
        existing.setType(updates.getType());
        existing.setScheduledDate(updates.getScheduledDate());
        existing.setMeetingLink(updates.getMeetingLink());
        existing.setStatus(updates.getStatus());
        existing.setFeedback(updates.getFeedback());
        existing.setUpdatedAt(LocalDateTime.now());
        Interview updated = interviewRepository.save(existing);
        log.info("Interview updated: {}", id);
        return updated;
    }

    private JobApplicationDTO convertToDTO(JobApplication application) {
        return JobApplicationDTO.builder()
                .id(application.getId())
                .jobId(application.getJobId())
                .studentId(application.getStudentId())
                .status(application.getStatus().name())
                .resumeUrl(application.getResumeUrl())
                .coverLetter(application.getCoverLetter())
                .build();
    }

    // === Analytics Methods ===
    public long getTotalJobPostings() {
        return jobPostingRepository.count();
    }

    public long getTotalApplications() {
        return jobApplicationRepository.count();
    }

    public long getTotalPlacementDrives() {
        return placementDriveRepository.count();
    }

    public long getTotalInterviews() {
        return interviewRepository.count();
    }

    public long getTotalCompanies() {
        // This would need company repository, but as a fallback return 0
        return 0;
    }

    public long getTotalPlaced() {
        return jobApplicationRepository.countByStatus(JobApplication.ApplicationStatus.SELECTED);
    }

    public long getTotalUnplaced() {
        return jobApplicationRepository.countByStatus(JobApplication.ApplicationStatus.APPLIED)
             + jobApplicationRepository.countByStatus(JobApplication.ApplicationStatus.SHORTLISTED);
    }
}
