/**
 * generate-admin-hash.js
 * Run with: node generate-admin-hash.js
 * Generates a BCrypt hash for Admin@123 and prints the SQL upsert statement.
 */
const bcrypt = require('bcryptjs');

const password = 'Admin@123';
const saltRounds = 10;

const hash = bcrypt.hashSync(password, saltRounds);

console.log('\n=== BCrypt hash for Admin@123 ===');
console.log(hash);
console.log('\n=== Run this SQL against placeit_auth (MySQL port 3307) ===');
console.log(`
INSERT INTO users (email, name, password, phone, role, email_verified, failed_attempts, account_locked, created_at, updated_at)
VALUES (
  'admin@placeit.com',
  'System Admin',
  '${hash}',
  '0000000000',
  'ADMIN',
  true,
  0,
  false,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  password = '${hash}',
  email_verified = true,
  failed_attempts = 0,
  account_locked = false,
  updated_at = NOW();
`);
console.log('=================================================\n');
