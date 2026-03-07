package com.meritquest.ml.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.*;

import java.util.List;
import java.util.Map;

/**
 * Mirrors the Python ML service JSON response structures.
 */
public class MLServiceDto {

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class RiskPrediction {
        @JsonAlias("student_id")
        private Long studentId;
        @JsonAlias("risk_score")
        private Double riskScore;
        @JsonAlias("risk_level")
        private String riskLevel;
        @JsonAlias("feature_importances")
        private Map<String, Double> featureImportances;
        @JsonAlias("model_type")
        private String modelType;
        @JsonAlias("model_version")
        private Integer modelVersion;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class PredictionResponse {
        private List<RiskPrediction> predictions;
        @JsonAlias("model_type")
        private String modelType;
        @JsonAlias("model_version")
        private Integer modelVersion;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class TrainResponse {
        @JsonAlias("model_type")
        private String modelType;
        private Integer version;
        private Map<String, Object> metrics;
        @JsonAlias("feature_importances")
        private Map<String, Double> featureImportances;
        @JsonAlias("sample_count")
        private Integer sampleCount;
        @JsonAlias("positive_count")
        private Integer positiveCount;
        @JsonAlias("negative_count")
        private Integer negativeCount;
        @JsonAlias("trained_at")
        private String trainedAt;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class TrainRequest {
        private String modelType;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class BatchPredictionRequest {
        private Long institutionId;
    }
}
