-- V5__convert_remaining_enums_to_varchar.sql
-- Convert all remaining PostgreSQL custom ENUM columns to VARCHAR

-- 1. Drop defaults that reference enum types
ALTER TABLE bulk_uploads ALTER COLUMN status DROP DEFAULT;
ALTER TABLE institutions ALTER COLUMN type DROP DEFAULT;
ALTER TABLE users ALTER COLUMN status DROP DEFAULT;

-- 2. Convert columns to VARCHAR
ALTER TABLE activities ALTER COLUMN category TYPE VARCHAR(30) USING category::text;
ALTER TABLE bulk_uploads ALTER COLUMN status TYPE VARCHAR(30) USING status::text;
ALTER TABLE bulk_uploads ALTER COLUMN upload_type TYPE VARCHAR(30) USING upload_type::text;
ALTER TABLE institutions ALTER COLUMN type TYPE VARCHAR(30) USING type::text;
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(30) USING role::text;
ALTER TABLE users ALTER COLUMN status TYPE VARCHAR(30) USING status::text;

-- 3. Re-add defaults as plain strings
ALTER TABLE bulk_uploads ALTER COLUMN status SET DEFAULT 'PENDING';
ALTER TABLE institutions ALTER COLUMN type SET DEFAULT 'SCHOOL';
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'ACTIVE';

-- 4. Drop the custom enum types
DROP TYPE IF EXISTS activity_category;
DROP TYPE IF EXISTS upload_status;
DROP TYPE IF EXISTS upload_type;
DROP TYPE IF EXISTS institution_type;
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS user_status;
