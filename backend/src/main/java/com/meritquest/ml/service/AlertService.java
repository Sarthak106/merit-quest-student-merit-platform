package com.meritquest.ml.service;

import com.meritquest.common.model.AlertSeverity;
import com.meritquest.common.model.AlertType;
import com.meritquest.ml.dto.AlertResponse;
import com.meritquest.ml.dto.MLServiceDto;
import com.meritquest.ml.entity.Alert;
import com.meritquest.ml.repository.AlertRepository;
import com.meritquest.student.entity.Student;
import com.meritquest.student.repository.StudentRepository;
import com.meritquest.user.entity.User;
import com.meritquest.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final MLServiceClient mlServiceClient;

    @Transactional
    public int generateAlerts(Long institutionId) {
        MLServiceDto.PredictionResponse predictions;
        try {
            predictions = mlServiceClient.predictDropoutRiskBatch(institutionId);
        } catch (Exception e) {
            log.error("Failed to get predictions from ML service: {}", e.getMessage());
            throw new RuntimeException("ML service unavailable: " + e.getMessage());
        }

        if (predictions == null || predictions.getPredictions() == null) {
            return 0;
        }

        int created = 0;
        for (MLServiceDto.RiskPrediction pred : predictions.getPredictions()) {
            if (pred.getRiskScore() < 0.3) continue;

            List<Alert> existing = alertRepository.findByStudentIdAndAlertTypeAndAcknowledgedFalse(
                    pred.getStudentId(), AlertType.DROPOUT_RISK);
            if (!existing.isEmpty()) continue;

            Student student = studentRepository.findById(pred.getStudentId()).orElse(null);
            if (student == null) continue;

            AlertSeverity severity = mapSeverity(pred.getRiskLevel());
            Map<String, Object> importances = pred.getFeatureImportances() != null
                    ? new HashMap<>(pred.getFeatureImportances()) : Map.of();

            Alert alert = Alert.builder()
                    .student(student)
                    .institution(student.getInstitution())
                    .alertType(AlertType.DROPOUT_RISK)
                    .severity(severity)
                    .riskScore(BigDecimal.valueOf(pred.getRiskScore()))
                    .message(buildMessage(student, pred))
                    .featureImportances(importances)
                    .modelVersion(pred.getModelVersion())
                    .acknowledged(false)
                    .build();

            alertRepository.save(alert);
            created++;
        }

        log.info("Generated {} alerts for institution {}", created, institutionId);
        return created;
    }

    public Page<AlertResponse> getAlertsByInstitution(Long institutionId, String severity, String type, Pageable pageable) {
        Page<Alert> page;
        if (severity != null) {
            page = alertRepository.findByInstitutionIdAndSeverityOrderByCreatedAtDesc(
                    institutionId, AlertSeverity.valueOf(severity), pageable);
        } else if (type != null) {
            page = alertRepository.findByInstitutionIdAndAlertTypeOrderByCreatedAtDesc(
                    institutionId, AlertType.valueOf(type), pageable);
        } else {
            page = alertRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId, pageable);
        }
        return page.map(this::toResponse);
    }

    public Page<AlertResponse> getAlertsByStudent(Long studentId, Pageable pageable) {
        return alertRepository.findByStudentIdOrderByCreatedAtDesc(studentId, pageable).map(this::toResponse);
    }

    public Page<AlertResponse> getUnacknowledgedAlerts(Long institutionId, Pageable pageable) {
        return alertRepository.findUnacknowledgedByInstitution(institutionId, pageable).map(this::toResponse);
    }

    @Transactional
    public AlertResponse acknowledgeAlert(Long alertId, Long userId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found: " + alertId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        alert.setAcknowledged(true);
        alert.setAcknowledgedBy(user);
        alert.setAcknowledgedAt(LocalDateTime.now());
        alertRepository.save(alert);

        return toResponse(alert);
    }

    public long getUnacknowledgedCount(Long institutionId) {
        return alertRepository.countUnacknowledgedByInstitution(institutionId);
    }

    public long getUnacknowledgedCountByStudent(Long studentId) {
        return alertRepository.countUnacknowledgedByStudent(studentId);
    }

    private AlertSeverity mapSeverity(String riskLevel) {
        if (riskLevel == null) return AlertSeverity.LOW;
        return switch (riskLevel.toUpperCase()) {
            case "CRITICAL" -> AlertSeverity.CRITICAL;
            case "HIGH" -> AlertSeverity.HIGH;
            case "MEDIUM" -> AlertSeverity.MEDIUM;
            default -> AlertSeverity.LOW;
        };
    }

    private String buildMessage(Student student, MLServiceDto.RiskPrediction pred) {
        String severityText = pred.getRiskLevel() != null ? pred.getRiskLevel().toLowerCase() : "unknown";
        return String.format(
                "%s %s (Grade %s) has a %s dropout risk with a score of %.1f%%.",
                student.getFirstName(), student.getLastName(),
                student.getGrade(), severityText,
                pred.getRiskScore() * 100
        );
    }

    private AlertResponse toResponse(Alert alert) {
        return AlertResponse.builder()
                .id(alert.getId())
                .studentId(alert.getStudent().getId())
                .studentName(alert.getStudent().getFirstName() + " " + alert.getStudent().getLastName())
                .enrollmentNumber(alert.getStudent().getEnrollmentNumber())
                .grade(alert.getStudent().getGrade())
                .institutionId(alert.getInstitution() != null ? alert.getInstitution().getId() : null)
                .institutionName(alert.getInstitution() != null ? alert.getInstitution().getName() : null)
                .alertType(alert.getAlertType())
                .severity(alert.getSeverity())
                .riskScore(alert.getRiskScore())
                .message(alert.getMessage())
                .featureImportances(alert.getFeatureImportances())
                .modelVersion(alert.getModelVersion())
                .acknowledged(alert.getAcknowledged())
                .acknowledgedByName(alert.getAcknowledgedBy() != null
                        ? alert.getAcknowledgedBy().getFirstName() + " " + alert.getAcknowledgedBy().getLastName() : null)
                .acknowledgedAt(alert.getAcknowledgedAt())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
