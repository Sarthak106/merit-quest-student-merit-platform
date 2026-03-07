package com.meritquest.ml.repository;

import com.meritquest.common.model.AlertSeverity;
import com.meritquest.common.model.AlertType;
import com.meritquest.ml.entity.Alert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    Page<Alert> findByStudentIdOrderByCreatedAtDesc(Long studentId, Pageable pageable);

    Page<Alert> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId, Pageable pageable);

    Page<Alert> findByInstitutionIdAndSeverityOrderByCreatedAtDesc(Long institutionId, AlertSeverity severity, Pageable pageable);

    Page<Alert> findByInstitutionIdAndAlertTypeOrderByCreatedAtDesc(Long institutionId, AlertType alertType, Pageable pageable);

    @Query("SELECT a FROM Alert a WHERE a.institution.id = :instId AND a.acknowledged = false ORDER BY " +
            "CASE a.severity WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END, a.createdAt DESC")
    Page<Alert> findUnacknowledgedByInstitution(@Param("instId") Long institutionId, Pageable pageable);

    List<Alert> findByStudentIdAndAlertTypeAndAcknowledgedFalse(Long studentId, AlertType alertType);

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.institution.id = :instId AND a.acknowledged = false")
    long countUnacknowledgedByInstitution(@Param("instId") Long institutionId);

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.student.id = :studentId AND a.acknowledged = false")
    long countUnacknowledgedByStudent(@Param("studentId") Long studentId);
}
