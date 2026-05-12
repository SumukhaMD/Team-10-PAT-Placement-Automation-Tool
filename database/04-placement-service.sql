-- PlaceIT Placement Service Database Schema
-- Database: placeit_placement

USE placeit_placement;

-- Placement Drives table
CREATE TABLE IF NOT EXISTS placement_drives (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    drive_name VARCHAR(255) NOT NULL,
    drive_code VARCHAR(50) UNIQUE,
    description TEXT,
    academic_year VARCHAR(20) NOT NULL,
    drive_type ENUM('ON_CAMPUS', 'OFF_CAMPUS', 'POOL_CAMPUS', 'VIRTUAL') DEFAULT 'ON_CAMPUS',
    start_date DATE NOT NULL,
    end_date DATE,
    registration_deadline DATETIME,
    venue VARCHAR(255),
    max_companies INT,
    status ENUM('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED') DEFAULT 'UPCOMING',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_academic_year (academic_year),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Postings table
CREATE TABLE IF NOT EXISTS job_postings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    drive_id BIGINT,
    job_title VARCHAR(255) NOT NULL,
    job_code VARCHAR(50) UNIQUE,
    job_type ENUM('FULL_TIME', 'INTERNSHIP', 'CONTRACT', 'PART_TIME') DEFAULT 'FULL_TIME',
    description TEXT,
    responsibilities TEXT,
    requirements TEXT,
    location VARCHAR(255),
    work_mode ENUM('ON_SITE', 'REMOTE', 'HYBRID') DEFAULT 'ON_SITE',
    ctc_min DECIMAL(12,2),
    ctc_max DECIMAL(12,2),
    stipend DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'INR',
    bond_years INT DEFAULT 0,
    bond_amount DECIMAL(12,2),
    openings INT DEFAULT 1,
    eligible_departments TEXT,
    eligible_branches TEXT,
    min_cgpa DECIMAL(4,2) DEFAULT 0,
    max_backlogs INT DEFAULT 0,
    min_tenth_percentage DECIMAL(5,2) DEFAULT 0,
    min_twelfth_percentage DECIMAL(5,2) DEFAULT 0,
    batch_year INT,
    skills_required TEXT,
    application_deadline DATETIME,
    status ENUM('DRAFT', 'OPEN', 'CLOSED', 'FILLED', 'CANCELLED') DEFAULT 'DRAFT',
    posted_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE SET NULL,
    INDEX idx_company_id (company_id),
    INDEX idx_drive_id (drive_id),
    INDEX idx_job_type (job_type),
    INDEX idx_status (status),
    INDEX idx_application_deadline (application_deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    resume_url VARCHAR(500),
    cover_letter TEXT,
    application_status ENUM(
        'APPLIED',
        'UNDER_REVIEW',
        'SHORTLISTED',
        'INTERVIEW_SCHEDULED',
        'INTERVIEW_COMPLETED',
        'SELECTED',
        'REJECTED',
        'OFFER_EXTENDED',
        'OFFER_ACCEPTED',
        'OFFER_DECLINED',
        'WITHDRAWN'
    ) DEFAULT 'APPLIED',
    recruiter_notes TEXT,
    rejection_reason TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, student_id),
    INDEX idx_job_id (job_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (application_status),
    INDEX idx_applied_at (applied_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    interview_round INT DEFAULT 1,
    round_name VARCHAR(100),
    interview_type ENUM('TECHNICAL', 'HR', 'APTITUDE', 'GROUP_DISCUSSION', 'CODING', 'MANAGERIAL', 'FINAL') DEFAULT 'TECHNICAL',
    interview_mode ENUM('IN_PERSON', 'VIDEO_CALL', 'PHONE', 'ONLINE_TEST') DEFAULT 'IN_PERSON',
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    venue VARCHAR(255),
    meeting_link VARCHAR(500),
    interviewer_name VARCHAR(255),
    interviewer_email VARCHAR(255),
    status ENUM('SCHEDULED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') DEFAULT 'SCHEDULED',
    feedback TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 10),
    result ENUM('PASSED', 'FAILED', 'ON_HOLD', 'PENDING') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id),
    INDEX idx_job_id (job_id),
    INDEX idx_student_id (student_id),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE,
    job_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    offered_ctc DECIMAL(12,2) NOT NULL,
    offered_position VARCHAR(255),
    joining_date DATE,
    offer_letter_url VARCHAR(500),
    offer_status ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED') DEFAULT 'PENDING',
    response_deadline DATE,
    decline_reason TEXT,
    offered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_company_id (company_id),
    INDEX idx_offer_status (offer_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Placement Records table (final placements)
CREATE TABLE IF NOT EXISTS placement_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    offer_id BIGINT NOT NULL UNIQUE,
    company_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    drive_id BIGINT,
    final_ctc DECIMAL(12,2) NOT NULL,
    position VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    joining_date DATE,
    placement_type ENUM('ON_CAMPUS', 'OFF_CAMPUS', 'POOL_CAMPUS') DEFAULT 'ON_CAMPUS',
    academic_year VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by BIGINT,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_company_id (company_id),
    INDEX idx_academic_year (academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Drive Registrations table (students registered for drives)
CREATE TABLE IF NOT EXISTS drive_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    drive_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    registration_status ENUM('REGISTERED', 'CONFIRMED', 'CANCELLED') DEFAULT 'REGISTERED',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (drive_id, student_id),
    INDEX idx_drive_id (drive_id),
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Placement Service schema created successfully!' AS Status;
