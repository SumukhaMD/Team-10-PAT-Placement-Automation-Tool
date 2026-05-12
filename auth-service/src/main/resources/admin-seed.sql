-- =============================================================================
-- PlaceIT — Bootstrap Admin Account
-- =============================================================================
-- Run this script ONCE against the auth-service database (placeit_auth) to
-- create the default system-administrator account.
--
-- Credentials:
--   Email    : admin@placeit.com
--   Password : Admin@123   (BCrypt-encoded below — do NOT change the hash)
--
-- After the first login, immediately change the password from the admin portal.
-- =============================================================================

INSERT INTO users (
    email,
    name,
    password,
    phone,
    role,
    email_verified,
    failed_attempts,
    account_locked,
    created_at,
    updated_at
)
VALUES (
    'admin@placeit.com',
    'System Admin',
    '$2a$10$ejSmQ/rce9Rkw/7xZUPDge4EeEO2qbYqh1EWLRfMYNGYDY9SOTvTy',
    '0000000000',
    'ADMIN',
    true,
    0,
    false,
    NOW(),
    NOW()
);
