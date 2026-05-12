-- Make drive_id nullable in the existing job_postings table.
-- This runs on every startup (spring.sql.init.mode: always) and is idempotent
-- because MODIFY COLUMN is a no-op if the column is already nullable.
ALTER TABLE job_postings MODIFY COLUMN drive_id BIGINT NULL;
