-- PlaceIT Notification Service Database Schema
-- Database: placeit_notification

USE placeit_notification;

-- Notification Templates table
CREATE TABLE IF NOT EXISTS notification_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_code VARCHAR(100) NOT NULL UNIQUE,
    template_name VARCHAR(255) NOT NULL,
    notification_type ENUM('EMAIL', 'SMS', 'PUSH', 'IN_APP') NOT NULL,
    subject VARCHAR(500),
    body_template TEXT NOT NULL,
    variables TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_template_code (template_code),
    INDEX idx_notification_type (notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification Logs table
CREATE TABLE IF NOT EXISTS notification_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    notification_type ENUM('EMAIL', 'SMS', 'PUSH', 'IN_APP') NOT NULL,
    template_id BIGINT,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body TEXT,
    status ENUM('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED') DEFAULT 'PENDING',
    error_message TEXT,
    retry_count INT DEFAULT 0,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES notification_templates(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Notification Preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    job_alerts BOOLEAN DEFAULT TRUE,
    interview_reminders BOOLEAN DEFAULT TRUE,
    application_updates BOOLEAN DEFAULT TRUE,
    drive_announcements BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- In-App Notifications table
CREATE TABLE IF NOT EXISTS in_app_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_category ENUM('JOB', 'INTERVIEW', 'APPLICATION', 'DRIVE', 'SYSTEM', 'OTHER') DEFAULT 'OTHER',
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scheduled Notifications table
CREATE TABLE IF NOT EXISTS scheduled_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_type ENUM('EMAIL', 'SMS', 'PUSH', 'IN_APP') NOT NULL,
    template_id BIGINT,
    recipient_type ENUM('USER', 'ROLE', 'ALL', 'CUSTOM') NOT NULL,
    recipient_ids TEXT,
    recipient_role VARCHAR(50),
    subject VARCHAR(500),
    body TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    status ENUM('SCHEDULED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'SCHEDULED',
    processed_at TIMESTAMP,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES notification_templates(id) ON DELETE SET NULL,
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default notification templates
INSERT INTO notification_templates (template_code, template_name, notification_type, subject, body_template, variables) VALUES
('WELCOME_EMAIL', 'Welcome Email', 'EMAIL', 'Welcome to PlaceIT - {{fullName}}!', 
 'Dear {{fullName}},\n\nWelcome to PlaceIT! Your account has been successfully created.\n\nYour registered email: {{email}}\nRole: {{role}}\n\nPlease verify your email to get started.\n\nBest regards,\nPlaceIT Team',
 'fullName,email,role'),
 
('OTP_VERIFICATION', 'OTP Verification', 'EMAIL', 'Your PlaceIT Verification Code',
 'Dear {{fullName}},\n\nYour OTP for verification is: {{otpCode}}\n\nThis code will expire in {{expiryMinutes}} minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nPlaceIT Team',
 'fullName,otpCode,expiryMinutes'),
 
('PASSWORD_RESET', 'Password Reset', 'EMAIL', 'Reset Your PlaceIT Password',
 'Dear {{fullName}},\n\nYou requested to reset your password. Click the link below:\n\n{{resetLink}}\n\nThis link will expire in 24 hours.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nPlaceIT Team',
 'fullName,resetLink'),
 
('JOB_APPLICATION_RECEIVED', 'Application Received', 'EMAIL', 'Application Received - {{jobTitle}} at {{companyName}}',
 'Dear {{studentName}},\n\nYour application for {{jobTitle}} at {{companyName}} has been received successfully.\n\nApplication ID: {{applicationId}}\nApplied on: {{appliedDate}}\n\nWe will notify you about the next steps.\n\nBest regards,\nPlaceIT Team',
 'studentName,jobTitle,companyName,applicationId,appliedDate'),
 
('INTERVIEW_SCHEDULED', 'Interview Scheduled', 'EMAIL', 'Interview Scheduled - {{companyName}}',
 'Dear {{studentName}},\n\nYour interview has been scheduled!\n\nCompany: {{companyName}}\nPosition: {{jobTitle}}\nRound: {{roundName}}\nDate: {{interviewDate}}\nTime: {{interviewTime}}\nMode: {{interviewMode}}\nVenue/Link: {{venueOrLink}}\n\nPlease be prepared and on time.\n\nBest regards,\nPlaceIT Team',
 'studentName,companyName,jobTitle,roundName,interviewDate,interviewTime,interviewMode,venueOrLink'),
 
('OFFER_EXTENDED', 'Offer Extended', 'EMAIL', 'Congratulations! Offer from {{companyName}}',
 'Dear {{studentName}},\n\nCongratulations! You have received an offer from {{companyName}}!\n\nPosition: {{position}}\nCTC: {{ctc}}\nJoining Date: {{joiningDate}}\n\nPlease respond by {{responseDeadline}}.\n\nBest regards,\nPlaceIT Team',
 'studentName,companyName,position,ctc,joiningDate,responseDeadline'),
 
('NEW_JOB_ALERT', 'New Job Alert', 'EMAIL', 'New Job Opportunity - {{jobTitle}} at {{companyName}}',
 'Dear {{studentName}},\n\nA new job matching your profile is available!\n\nCompany: {{companyName}}\nPosition: {{jobTitle}}\nCTC: {{ctcRange}}\nDeadline: {{deadline}}\n\nApply now on PlaceIT!\n\nBest regards,\nPlaceIT Team',
 'studentName,companyName,jobTitle,ctcRange,deadline');

SELECT 'Notification Service schema created successfully!' AS Status;
