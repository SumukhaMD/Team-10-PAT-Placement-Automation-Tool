-- PlaceIT Student Service Database Schema
-- Database: placeit_student

USE placeit_student;

-- Student Profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    enrollment_number VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    branch VARCHAR(100),
    semester INT,
    batch_year INT NOT NULL,
    graduation_year INT NOT NULL,
    cgpa DECIMAL(4,2),
    tenth_percentage DECIMAL(5,2),
    twelfth_percentage DECIMAL(5,2),
    diploma_percentage DECIMAL(5,2),
    backlogs INT DEFAULT 0,
    active_backlogs INT DEFAULT 0,
    date_of_birth DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    profile_photo_url VARCHAR(500),
    resume_url VARCHAR(500),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    is_placed BOOLEAN DEFAULT FALSE,
    placement_status ENUM('NOT_PLACED', 'PLACED', 'MULTIPLE_OFFERS') DEFAULT 'NOT_PLACED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_enrollment (enrollment_number),
    INDEX idx_department (department),
    INDEX idx_batch_year (batch_year),
    INDEX idx_graduation_year (graduation_year),
    INDEX idx_cgpa (cgpa),
    INDEX idx_placement_status (placement_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Skills table
CREATE TABLE IF NOT EXISTS student_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT') DEFAULT 'INTERMEDIATE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_skill (student_id, skill_name),
    INDEX idx_skill_name (skill_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Education table
CREATE TABLE IF NOT EXISTS student_education (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    degree VARCHAR(100) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    board_university VARCHAR(255),
    start_year INT,
    end_year INT,
    percentage_cgpa VARCHAR(20),
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Experience table (Internships/Projects)
CREATE TABLE IF NOT EXISTS student_experience (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    experience_type ENUM('INTERNSHIP', 'PROJECT', 'WORK') NOT NULL,
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    description TEXT,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    skills_used TEXT,
    certificate_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_experience_type (experience_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Certifications table
CREATE TABLE IF NOT EXISTS student_certifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    certification_name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(255),
    credential_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Documents table
CREATE TABLE IF NOT EXISTS student_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    document_type ENUM('RESUME', 'TRANSCRIPT', 'ID_PROOF', 'ADDRESS_PROOF', 'CERTIFICATE', 'OTHER') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_document_type (document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Student Service schema created successfully!' AS Status;
