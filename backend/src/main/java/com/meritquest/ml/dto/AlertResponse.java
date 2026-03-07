package com.meritquest.ml.dto;

import com.meritquest.common.model.AlertSeverity;
import com.meritquest.common.model.AlertType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AlertResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String enrollmentNumber;
    private String grade;
    private Long institutionId;
    private String institutionName;
    private AlertType alertType;
    private AlertSeverity severity;
    private BigDecimal riskScore;
    private String message;
    private Map<String, Object> featureImportances;
    private Integer modelVersion;
    private Boolean acknowledged;
    private String acknowledgedByName;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime createdAt;
}
