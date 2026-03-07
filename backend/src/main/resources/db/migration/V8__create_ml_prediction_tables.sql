-- Phase 7: ML Pipeline — Early Warning & Dropout Prediction tables

-- ML model version registry
CREATE TABLE ml_model_versions (
    id                    BIGSERIAL PRIMARY KEY,
    model_type            VARCHAR(50)  NOT NULL,    -- random_forest, gradient_boosting, xgboost
    version               INTEGER      NOT NULL,
    file_key              VARCHAR(500) NOT NULL,    -- MinIO object path
    metrics               JSONB        NOT NULL DEFAULT '{}',
    feature_importances   JSONB        NOT NULL DEFAULT '{}',
    training_samples      INTEGER,
    feature_count         INTEGER,
    trained_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),

    UNIQUE (model_type, version)
);

CREATE INDEX idx_ml_model_versions_type ON ml_model_versions(model_type);
CREATE INDEX idx_ml_model_versions_trained ON ml_model_versions(trained_at);

-- Alerts / early warning notifications
CREATE TABLE alerts (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT       NOT NULL REFERENCES students(id),
    institution_id      BIGINT       REFERENCES institutions(id),
    alert_type          VARCHAR(50)  NOT NULL,   -- DROPOUT_RISK, DECLINING_PERFORMANCE
    severity            VARCHAR(20)  NOT NULL,   -- LOW, MEDIUM, HIGH, CRITICAL
    risk_score          NUMERIC(6,4),
    message             TEXT,
    feature_importances JSONB        NOT NULL DEFAULT '{}',
    model_version       INTEGER,
    acknowledged        BOOLEAN      NOT NULL DEFAULT FALSE,
    acknowledged_by     BIGINT       REFERENCES users(id),
    acknowledged_at     TIMESTAMP,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_student ON alerts(student_id);
CREATE INDEX idx_alerts_institution ON alerts(institution_id);
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX idx_alerts_created ON alerts(created_at);
