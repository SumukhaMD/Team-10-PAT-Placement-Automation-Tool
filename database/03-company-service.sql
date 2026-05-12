-- PlaceIT Company Service Database Schema
-- Database: placeit_company

USE placeit_company;

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_code VARCHAR(50) UNIQUE,
    industry VARCHAR(100),
    company_type ENUM('STARTUP', 'MNC', 'SME', 'GOVERNMENT', 'NGO', 'OTHER') DEFAULT 'OTHER',
    description TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(500),
    headquarters VARCHAR(255),
    founded_year INT,
    employee_count VARCHAR(50),
    linkedin_url VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(10),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company_name (company_name),
    INDEX idx_industry (industry),
    INDEX idx_company_type (company_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recruiters table
CREATE TABLE IF NOT EXISTS recruiters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    company_id BIGINT NOT NULL,
    designation VARCHAR(100),
    department VARCHAR(100),
    is_primary_contact BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_company_id (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Company Locations table (for companies with multiple offices)
CREATE TABLE IF NOT EXISTS company_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(10),
    is_headquarters BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Company Documents table
CREATE TABLE IF NOT EXISTS company_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    document_type ENUM('REGISTRATION', 'PAN', 'GST', 'MOU', 'OTHER') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Company Reviews table (by students who were placed)
CREATE TABLE IF NOT EXISTS company_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_title VARCHAR(255),
    review_text TEXT,
    pros TEXT,
    cons TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Company Service schema created successfully!' AS Status;
