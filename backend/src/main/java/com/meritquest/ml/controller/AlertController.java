package com.meritquest.ml.controller;

import com.meritquest.user.entity.User;
import com.meritquest.common.dto.ApiResponse;
import com.meritquest.ml.dto.AlertResponse;
import com.meritquest.ml.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'PARENT', 'SCHOOL_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Page<AlertResponse>>> getStudentAlerts(
            @PathVariable Long studentId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(alertService.getAlertsByStudent(studentId, pageable)));
    }

    @GetMapping("/institution/{institutionId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Page<AlertResponse>>> getInstitutionAlerts(
            @PathVariable Long institutionId,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String type,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                alertService.getAlertsByInstitution(institutionId, severity, type, pageable)));
    }

    @GetMapping("/institution/{institutionId}/unacknowledged")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Page<AlertResponse>>> getUnacknowledgedAlerts(
            @PathVariable Long institutionId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                alertService.getUnacknowledgedAlerts(institutionId, pageable)));
    }

    @PutMapping("/{alertId}/acknowledge")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<AlertResponse>> acknowledgeAlert(
            @PathVariable Long alertId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(alertService.acknowledgeAlert(alertId, user.getId())));
    }

    @PostMapping("/generate/{institutionId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Integer>> generateAlerts(@PathVariable Long institutionId) {
        int count = alertService.generateAlerts(institutionId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/count/institution/{institutionId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getUnacknowledgedCount(@PathVariable Long institutionId) {
        return ResponseEntity.ok(ApiResponse.success(alertService.getUnacknowledgedCount(institutionId)));
    }

    @GetMapping("/count/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'PARENT', 'SCHOOL_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getStudentUnacknowledgedCount(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(alertService.getUnacknowledgedCountByStudent(studentId)));
    }
}
