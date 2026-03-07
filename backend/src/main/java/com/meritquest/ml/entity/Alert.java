package com.meritquest.ml.entity;

import com.meritquest.common.model.AlertSeverity;
import com.meritquest.common.model.AlertType;
import com.meritquest.student.entity.Student;
import com.meritquest.user.entity.Institution;
import com.meritquest.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "alerts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id")
    private Institution institution;

    @Column(name = "alert_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AlertType alertType;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private AlertSeverity severity;

    @Column(name = "risk_score", precision = 6, scale = 4)
    private BigDecimal riskScore;

    private String message;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "feature_importances", columnDefinition = "jsonb")
    private Map<String, Object> featureImportances;

    @Column(name = "model_version")
    private Integer modelVersion;

    @Column(nullable = false)
    @Builder.Default
    private Boolean acknowledged = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acknowledged_by")
    private User acknowledgedBy;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
