package com.meritquest.ml.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "ml_model_versions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MLModelVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_type", nullable = false, length = 50)
    private String modelType;

    @Column(nullable = false)
    private Integer version;

    @Column(name = "file_key", nullable = false, length = 500)
    private String fileKey;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metrics;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "feature_importances", columnDefinition = "jsonb")
    private Map<String, Object> featureImportances;

    @Column(name = "training_samples")
    private Integer trainingSamples;

    @Column(name = "feature_count")
    private Integer featureCount;

    @Column(name = "trained_at", nullable = false)
    @Builder.Default
    private LocalDateTime trainedAt = LocalDateTime.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
