-- V4__convert_pg_enums_to_varchar.sql
-- Convert PostgreSQL custom ENUM columns to VARCHAR for JPA/Hibernate compatibility

-- 1. Drop default values that reference enum types
ALTER TABLE students ALTER COLUMN verification_status DROP DEFAULT;
ALTER TABLE verification_queue ALTER COLUMN status DROP DEFAULT;

-- 2. Convert enum columns to VARCHAR
ALTER TABLE students ALTER COLUMN gender TYPE VARCHAR(10) USING gender::text;
ALTER TABLE students ALTER COLUMN verification_status TYPE VARCHAR(30) USING verification_status::text;
ALTER TABLE verification_queue ALTER COLUMN record_type TYPE VARCHAR(30) USING record_type::text;
ALTER TABLE verification_queue ALTER COLUMN status TYPE VARCHAR(30) USING status::text;

-- 3. Re-add default values as plain strings
ALTER TABLE students ALTER COLUMN verification_status SET DEFAULT 'PENDING_VERIFICATION';
ALTER TABLE verification_queue ALTER COLUMN status SET DEFAULT 'PENDING';

-- 4. Drop the custom enum types (no longer needed)
DROP TYPE IF EXISTS gender;
DROP TYPE IF EXISTS verification_status;
DROP TYPE IF EXISTS record_type;
