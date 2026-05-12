-- PlaceIT - Master SQL Script
-- This script runs all database setup scripts in order

-- IMPORTANT: Run this script as MySQL root user
-- mysql -u root -p < run-all.sql

-- Set character encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Run scripts in order
SOURCE 00-init-databases.sql;
SOURCE 01-auth-service.sql;
SOURCE 02-student-service.sql;
SOURCE 03-company-service.sql;
SOURCE 04-placement-service.sql;
SOURCE 05-notification-service.sql;
SOURCE 06-seed-data.sql;

SELECT '===========================================' AS '';
SELECT 'PlaceIT Database Setup Complete!' AS Status;
SELECT '===========================================' AS '';
SELECT 'Databases created:' AS '';
SELECT '  - placeit_auth' AS '';
SELECT '  - placeit_student' AS '';
SELECT '  - placeit_company' AS '';
SELECT '  - placeit_placement' AS '';
SELECT '  - placeit_notification' AS '';
SELECT '' AS '';
SELECT 'Default user: placeit_user' AS '';
SELECT 'Default password: placeit_password' AS '';
SELECT '===========================================' AS '';
