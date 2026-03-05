-- V2__create_student_data_tables.sql

-- Gender enum
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- Students
CREATE TABLE students (
    id                BIGSERIAL PRIMARY KEY,
    enrollment_number VARCHAR(50)  NOT NULL,
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100) NOT NULL,
    date_of_birth     DATE         NOT NULL,
    gender            gender       NOT NULL,
    grade             VARCHAR(20)  NOT NULL,
    section           VARCHAR(10),
    guardian_name     VARCHAR(200),
    guardian_phone    VARCHAR(20),
    guardian_email    VARCHAR(255),
    address           TEXT,
    institution_id    BIGINT       NOT NULL REFERENCES institutions(id),
    user_id           BIGINT       REFERENCES users(id),
    active            BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (enrollment_number, institution_id)
);

CREATE INDEX idx_students_institution ON students(institution_id);
CREATE INDEX idx_students_grade ON students(grade);
CREATE INDEX idx_students_enrollment ON students(enrollment_number);

-- Academic records
CREATE TABLE academic_records (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT       NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject         VARCHAR(100) NOT NULL,
    exam_type       VARCHAR(50)  NOT NULL,
    marks_obtained  DECIMAL(6,2) NOT NULL,
    max_marks       DECIMAL(6,2) NOT NULL,
    grade           VARCHAR(5),
    academic_year   VARCHAR(20)  NOT NULL,
    semester        VARCHAR(20),
    institution_id  BIGINT       NOT NULL REFERENCES institutions(id),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_academic_records_student ON academic_records(student_id);
CREATE INDEX idx_academic_records_year ON academic_records(academic_year);

-- Attendance records
CREATE TABLE attendance_records (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    month           VARCHAR(20) NOT NULL,
    academic_year   VARCHAR(20) NOT NULL,
    total_days      INT         NOT NULL,
    days_present    INT         NOT NULL,
    days_absent     INT         NOT NULL,
    institution_id  BIGINT      NOT NULL REFERENCES institutions(id),
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attendance_student ON attendance_records(student_id);

-- Activities (extracurricular)
CREATE TYPE activity_category AS ENUM ('SPORTS', 'ARTS', 'ACADEMICS', 'COMMUNITY_SERVICE', 'LEADERSHIP', 'OTHER');

CREATE TABLE activities (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT            NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title           VARCHAR(255)      NOT NULL,
    category        activity_category NOT NULL,
    description     TEXT,
    achievement     VARCHAR(255),
    event_date      DATE,
    institution_id  BIGINT            NOT NULL REFERENCES institutions(id),
    created_at      TIMESTAMP         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_student ON activities(student_id);
CREATE INDEX idx_activities_category ON activities(category);

-- Certificates
CREATE TABLE certificates (
    id              BIGSERIAL    PRIMARY KEY,
    student_id      BIGINT       NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    issuing_body    VARCHAR(255),
    issue_date      DATE,
    file_key        VARCHAR(500) NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    file_size       BIGINT,
    content_type    VARCHAR(100),
    institution_id  BIGINT       NOT NULL REFERENCES institutions(id),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_certificates_student ON certificates(student_id);

-- Bulk uploads
CREATE TYPE upload_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE upload_type AS ENUM ('STUDENTS', 'ACADEMIC_RECORDS', 'ATTENDANCE', 'ACTIVITIES');

CREATE TABLE bulk_uploads (
    id              BIGSERIAL     PRIMARY KEY,
    file_name       VARCHAR(255)  NOT NULL,
    upload_type     upload_type   NOT NULL,
    status          upload_status NOT NULL DEFAULT 'PENDING',
    total_rows      INT           DEFAULT 0,
    success_rows    INT           DEFAULT 0,
    failed_rows     INT           DEFAULT 0,
    error_details   JSONB,
    uploaded_by     BIGINT        NOT NULL REFERENCES users(id),
    institution_id  BIGINT        NOT NULL REFERENCES institutions(id),
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bulk_uploads_institution ON bulk_uploads(institution_id);
CREATE INDEX idx_bulk_uploads_status ON bulk_uploads(status);
