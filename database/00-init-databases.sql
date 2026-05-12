-- PlaceIT - Database Initialization Script
-- Run this script first to create all databases

-- Create databases for each microservice
CREATE DATABASE IF NOT EXISTS placeit_auth;
CREATE DATABASE IF NOT EXISTS placeit_student;
CREATE DATABASE IF NOT EXISTS placeit_company;
CREATE DATABASE IF NOT EXISTS placeit_placement;
CREATE DATABASE IF NOT EXISTS placeit_notification;

-- Root user is configured (root/sumu123)

FLUSH PRIVILEGES;

SELECT 'All PlaceIT databases created successfully!' AS Status;
