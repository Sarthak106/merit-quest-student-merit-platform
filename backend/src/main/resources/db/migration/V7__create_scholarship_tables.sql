-- Phase 6: Scholarship Management tables

-- Scholarships posted by NGOs, Gov Authorities, or System Admins
CREATE TABLE scholarships (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(255)   NOT NULL,
    description         TEXT,
    organization_name   VARCHAR(255)   NOT NULL,
    organization_type   VARCHAR(30)    NOT NULL,  -- NGO, GOVERNMENT, PRIVATE
    amount              NUMERIC(12,2),
    currency            VARCHAR(10)    NOT NULL DEFAULT 'INR',
    total_slots         INTEGER,
    filled_slots        INTEGER        NOT NULL DEFAULT 0,

    -- Eligibility criteria stored as JSON
    eligibility_criteria JSONB          NOT NULL DEFAULT '{}',
    -- Example: {"minCompositeScore": 0.5, "grades": ["10","12"], "districts": ["Central"], "boards": ["CBSE"]}

    application_deadline DATE,
    start_date          DATE,
    end_date            DATE,

    status              VARCHAR(30)    NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, CLOSED, DRAFT, CANCELLED
    posted_by           BIGINT         NOT NULL REFERENCES users(id),
    institution_id      BIGINT         REFERENCES institutions(id),

    created_at          TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scholarships_status ON scholarships(status);
CREATE INDEX idx_scholarships_posted_by ON scholarships(posted_by);
CREATE INDEX idx_scholarships_deadline ON scholarships(application_deadline);
CREATE INDEX idx_scholarships_eligibility ON scholarships USING GIN (eligibility_criteria);

-- Scholarship applications from students
CREATE TABLE scholarship_applications (
    id                  BIGSERIAL PRIMARY KEY,
    scholarship_id      BIGINT         NOT NULL REFERENCES scholarships(id),
    student_id          BIGINT         NOT NULL REFERENCES students(id),
    status              VARCHAR(30)    NOT NULL DEFAULT 'PENDING',  -- PENDING, APPROVED, REJECTED, WITHDRAWN
    merit_score_at_application NUMERIC(10,6),
    statement           TEXT,
    reviewer_id         BIGINT         REFERENCES users(id),
    reviewer_comment    TEXT,
    reviewed_at         TIMESTAMP,
    applied_at          TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP      NOT NULL DEFAULT NOW(),

    UNIQUE (scholarship_id, student_id)
);

CREATE INDEX idx_scholarship_apps_scholarship ON scholarship_applications(scholarship_id);
CREATE INDEX idx_scholarship_apps_student ON scholarship_applications(student_id);
CREATE INDEX idx_scholarship_apps_status ON scholarship_applications(status);
