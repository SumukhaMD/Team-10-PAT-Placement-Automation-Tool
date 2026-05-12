-- PlaceIT Seed Data Script
-- This script inserts sample data for testing

-- ========================================
-- AUTH SERVICE SEED DATA
-- ========================================
USE placeit_auth;

-- Insert sample users (passwords are hashed 'Password@123')
INSERT INTO users (email, password, full_name, phone, role, is_verified, is_active) VALUES
('admin@placeit.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqvJ8R5hPl7B/NKENdV1qMxe5YNWW', 'System Admin', '9876543210', 'ADMIN', TRUE, TRUE),
('tpo@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqvJ8R5hPl7B/NKENdV1qMxe5YNWW', 'Dr. Rajesh Kumar', '9876543211', 'TPO', TRUE, TRUE),
('recruiter@techcorp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqvJ8R5hPl7B/NKENdV1qMxe5YNWW', 'Priya Sharma', '9876543212', 'RECRUITER', TRUE, TRUE),
('recruiter@innovate.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqvJ8R5hPl7B/NKENdV1qMxe5YNWW', 'Amit Verma', '9876543213', 'RECRUITER', TRUE, TRUE),
('student1@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqvJ8R5hPl7B/NKENdV1qMxe5YNWW', 'Rahul Gupta', '9876543214', 'STUDENT', TRUE, TRUE),
('student2@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqvJ8R5hPl7B/NKENdV1qMxe5YNWW', 'Sneha Patel', '9876543215', 'STUDENT', TRUE, TRUE),
('student3@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqvJ8R5hPl7B/NKENdV1qMxe5YNWW', 'Vikram Singh', '9876543216', 'STUDENT', TRUE, TRUE);

-- ========================================
-- COMPANY SERVICE SEED DATA
-- ========================================
USE placeit_company;

-- Insert sample companies
INSERT INTO companies (company_name, company_code, industry, company_type, description, website, headquarters, founded_year, employee_count, email, is_verified, is_active) VALUES
('TechCorp Solutions', 'TECH001', 'Information Technology', 'MNC', 'Leading IT services and consulting company specializing in digital transformation.', 'https://techcorp.com', 'Bangalore', 2005, '10000+', 'hr@techcorp.com', TRUE, TRUE),
('Innovate Labs', 'INNO001', 'Software Development', 'STARTUP', 'Fast-growing startup building innovative SaaS products.', 'https://innovatelabs.io', 'Pune', 2018, '100-500', 'careers@innovatelabs.io', TRUE, TRUE),
('GlobalFinance Inc', 'GFI001', 'Finance', 'MNC', 'Global financial services company.', 'https://globalfinance.com', 'Mumbai', 1995, '50000+', 'recruit@globalfinance.com', TRUE, TRUE),
('DataDriven Analytics', 'DDA001', 'Data Analytics', 'SME', 'Data analytics and business intelligence solutions.', 'https://datadriven.in', 'Hyderabad', 2015, '500-1000', 'hr@datadriven.in', TRUE, TRUE),
('CloudNine Systems', 'CNS001', 'Cloud Computing', 'STARTUP', 'Cloud infrastructure and DevOps solutions provider.', 'https://cloudnine.tech', 'Bangalore', 2020, '50-100', 'jobs@cloudnine.tech', TRUE, TRUE);

-- Insert sample recruiters
INSERT INTO recruiters (user_id, company_id, designation, department, is_primary_contact, is_active) VALUES
(3, 1, 'HR Manager', 'Human Resources', TRUE, TRUE),
(4, 2, 'Talent Acquisition Lead', 'HR', TRUE, TRUE);

-- ========================================
-- STUDENT SERVICE SEED DATA
-- ========================================
USE placeit_student;

-- Insert sample student profiles
INSERT INTO student_profiles (user_id, enrollment_number, department, branch, semester, batch_year, graduation_year, cgpa, tenth_percentage, twelfth_percentage, backlogs, active_backlogs, gender, city, state) VALUES
(5, 'CS2021001', 'Computer Science', 'Computer Science & Engineering', 8, 2021, 2025, 8.50, 92.00, 88.50, 0, 0, 'MALE', 'Delhi', 'Delhi'),
(6, 'CS2021002', 'Computer Science', 'Information Technology', 8, 2021, 2025, 9.20, 95.00, 91.00, 0, 0, 'FEMALE', 'Mumbai', 'Maharashtra'),
(7, 'EC2021003', 'Electronics', 'Electronics & Communication', 8, 2021, 2025, 7.80, 88.00, 85.00, 1, 0, 'MALE', 'Chennai', 'Tamil Nadu');

-- Insert sample skills
INSERT INTO student_skills (student_id, skill_name, proficiency_level) VALUES
(1, 'Java', 'ADVANCED'),
(1, 'Spring Boot', 'INTERMEDIATE'),
(1, 'React', 'INTERMEDIATE'),
(1, 'MySQL', 'ADVANCED'),
(2, 'Python', 'ADVANCED'),
(2, 'Machine Learning', 'ADVANCED'),
(2, 'TensorFlow', 'INTERMEDIATE'),
(2, 'SQL', 'ADVANCED'),
(3, 'C++', 'ADVANCED'),
(3, 'Embedded Systems', 'INTERMEDIATE'),
(3, 'VHDL', 'INTERMEDIATE');

-- ========================================
-- PLACEMENT SERVICE SEED DATA
-- ========================================
USE placeit_placement;

-- Insert sample placement drives
INSERT INTO placement_drives (drive_name, drive_code, description, academic_year, drive_type, start_date, end_date, registration_deadline, venue, status, created_by) VALUES
('Campus Placement Drive 2025', 'CPD2025', 'Annual campus placement drive for 2025 batch', '2024-25', 'ON_CAMPUS', '2025-01-15', '2025-03-31', '2025-01-10 23:59:59', 'Main Auditorium', 'ONGOING', 2),
('Tech Giants Hiring Drive', 'TGH2025', 'Special drive for top tech companies', '2024-25', 'ON_CAMPUS', '2025-02-01', '2025-02-28', '2025-01-25 23:59:59', 'Conference Hall A', 'UPCOMING', 2),
('Virtual Pool Campus 2025', 'VPC2025', 'Virtual pool campus drive', '2024-25', 'POOL_CAMPUS', '2025-03-01', '2025-03-15', '2025-02-25 23:59:59', 'Online', 'UPCOMING', 2);

-- Insert sample job postings
INSERT INTO job_postings (company_id, drive_id, job_title, job_code, job_type, description, location, work_mode, ctc_min, ctc_max, openings, eligible_departments, min_cgpa, max_backlogs, batch_year, skills_required, application_deadline, status, posted_by) VALUES
(1, 1, 'Software Engineer', 'TECH001-SE01', 'FULL_TIME', 'Join our engineering team to build scalable applications using Java and microservices.', 'Bangalore', 'HYBRID', 800000, 1200000, 15, 'Computer Science,Information Technology', 7.00, 0, 2025, 'Java,Spring Boot,Microservices,SQL', '2025-01-20 23:59:59', 'OPEN', 3),
(1, 1, 'Data Analyst', 'TECH001-DA01', 'FULL_TIME', 'Analyze large datasets and provide business insights.', 'Bangalore', 'ON_SITE', 700000, 1000000, 10, 'Computer Science,Information Technology,Mathematics', 7.50, 0, 2025, 'Python,SQL,Tableau,Excel', '2025-01-20 23:59:59', 'OPEN', 3),
(2, 1, 'Full Stack Developer', 'INNO001-FSD01', 'FULL_TIME', 'Build end-to-end web applications using modern technologies.', 'Pune', 'REMOTE', 900000, 1400000, 8, 'Computer Science,Information Technology', 7.50, 0, 2025, 'React,Node.js,MongoDB,TypeScript', '2025-01-25 23:59:59', 'OPEN', 4),
(2, NULL, 'ML Engineer Intern', 'INNO001-MLI01', 'INTERNSHIP', '6-month internship in Machine Learning team.', 'Pune', 'HYBRID', NULL, NULL, 5, 'Computer Science,Information Technology', 8.00, 0, 2025, 'Python,TensorFlow,PyTorch,Machine Learning', '2025-02-15 23:59:59', 'OPEN', 4);

-- Insert sample applications
INSERT INTO job_applications (job_id, student_id, application_status, applied_at) VALUES
(1, 5, 'SHORTLISTED', '2025-01-10 10:30:00'),
(1, 6, 'INTERVIEW_SCHEDULED', '2025-01-10 11:45:00'),
(2, 6, 'APPLIED', '2025-01-11 09:15:00'),
(3, 5, 'UNDER_REVIEW', '2025-01-12 14:20:00'),
(3, 7, 'APPLIED', '2025-01-12 16:00:00');

-- Insert sample interviews
INSERT INTO interviews (application_id, job_id, student_id, interview_round, round_name, interview_type, interview_mode, scheduled_date, scheduled_time, duration_minutes, venue, status) VALUES
(2, 1, 6, 1, 'Technical Round 1', 'TECHNICAL', 'VIDEO_CALL', '2025-01-18', '10:00:00', 60, NULL, 'SCHEDULED'),
(2, 1, 6, 2, 'Technical Round 2', 'CODING', 'ONLINE_TEST', '2025-01-20', '14:00:00', 90, NULL, 'SCHEDULED');

SELECT 'Seed data inserted successfully!' AS Status;
