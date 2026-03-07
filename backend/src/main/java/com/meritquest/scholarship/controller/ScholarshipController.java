package com.meritquest.scholarship.controller;

import com.meritquest.audit.AuditLogged;
import com.meritquest.common.dto.ApiResponse;
import com.meritquest.scholarship.dto.*;
import com.meritquest.scholarship.service.ScholarshipMatchingService;
import com.meritquest.scholarship.service.ScholarshipService;
import com.meritquest.common.model.ScholarshipStatus;
import com.meritquest.student.entity.Student;
import com.meritquest.student.repository.StudentRepository;
import com.meritquest.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scholarships")
@RequiredArgsConstructor
public class ScholarshipController {

    private final ScholarshipService scholarshipService;
    private final ScholarshipMatchingService matchingService;
    private final StudentRepository studentRepository;

    // ---- Scholarship CRUD ----

    @PostMapping
    @PreAuthorize("hasAnyRole('NGO_REP', 'GOV_AUTHORITY', 'SYSTEM_ADMIN')")
    @AuditLogged(action = "CREATE_SCHOLARSHIP", entityType = "SCHOLARSHIP")
    public ResponseEntity<ApiResponse<ScholarshipResponse>> create(
            @Valid @RequestBody ScholarshipRequest request,
            @AuthenticationPrincipal User user) {
        ScholarshipResponse response = scholarshipService.createScholarship(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Scholarship created", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('NGO_REP', 'GOV_AUTHORITY', 'SYSTEM_ADMIN')")
    @AuditLogged(action = "UPDATE_SCHOLARSHIP", entityType = "SCHOLARSHIP")
    public ResponseEntity<ApiResponse<ScholarshipResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ScholarshipRequest request,
            @AuthenticationPrincipal User user) {
        ScholarshipResponse response = scholarshipService.updateScholarship(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Scholarship updated", response));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('NGO_REP', 'GOV_AUTHORITY', 'SYSTEM_ADMIN')")
    @AuditLogged(action = "CLOSE_SCHOLARSHIP", entityType = "SCHOLARSHIP")
    public ResponseEntity<ApiResponse<Void>> close(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        scholarshipService.closeScholarship(id, user);
        return ResponseEntity.ok(ApiResponse.success("Scholarship closed", null));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<ScholarshipResponse>>> list(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 12) Pageable pageable) {
        ScholarshipStatus scholarshipStatus = status != null ? ScholarshipStatus.valueOf(status) : null;
        Long studentId = resolveStudentId(user);
        Page<ScholarshipResponse> page = scholarshipService.listScholarships(scholarshipStatus, pageable, studentId);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('NGO_REP', 'GOV_AUTHORITY', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Page<ScholarshipResponse>>> listMine(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.success(scholarshipService.listMyScholarships(user.getId(), pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ScholarshipResponse>> getOne(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Long studentId = resolveStudentId(user);
        return ResponseEntity.ok(
                ApiResponse.success(scholarshipService.getScholarship(id, studentId)));
    }

    // ---- Applications ----

    @PostMapping("/apply")
    @PreAuthorize("hasRole('STUDENT')")
    @AuditLogged(action = "APPLY_SCHOLARSHIP", entityType = "SCHOLARSHIP_APPLICATION")
    public ResponseEntity<ApiResponse<ApplicationResponse>> apply(
            @Valid @RequestBody ApplicationRequest request,
            @AuthenticationPrincipal User user) {
        ApplicationResponse response = scholarshipService.applyToScholarship(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application submitted", response));
    }

    @PostMapping("/applications/{applicationId}/decide")
    @PreAuthorize("hasAnyRole('NGO_REP', 'GOV_AUTHORITY', 'SYSTEM_ADMIN')")
    @AuditLogged(action = "DECIDE_APPLICATION", entityType = "SCHOLARSHIP_APPLICATION")
    public ResponseEntity<ApiResponse<ApplicationResponse>> decide(
            @PathVariable Long applicationId,
            @Valid @RequestBody ApplicationDecisionRequest request,
            @AuthenticationPrincipal User user) {
        ApplicationResponse response = scholarshipService.decideApplication(applicationId, request, user);
        return ResponseEntity.ok(ApiResponse.success("Application decision recorded", response));
    }

    @DeleteMapping("/{scholarshipId}/withdraw")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> withdraw(
            @PathVariable Long scholarshipId,
            @AuthenticationPrincipal User user) {
        scholarshipService.withdrawApplication(scholarshipId, user);
        return ResponseEntity.ok(ApiResponse.success("Application withdrawn", null));
    }

    @GetMapping("/{scholarshipId}/applications")
    @PreAuthorize("hasAnyRole('NGO_REP', 'GOV_AUTHORITY', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Page<ApplicationResponse>>> getApplications(
            @PathVariable Long scholarshipId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.success(scholarshipService.getApplicationsForScholarship(scholarshipId, pageable)));
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Page<ApplicationResponse>>> myApplications(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.success(scholarshipService.getMyApplications(user, pageable)));
    }

    // ---- Matching ----

    @GetMapping("/{scholarshipId}/eligible-students")
    @PreAuthorize("hasAnyRole('NGO_REP', 'GOV_AUTHORITY', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<EligibleStudentsResponse>> getEligibleStudents(
            @PathVariable Long scholarshipId) {
        return ResponseEntity.ok(
                ApiResponse.success(matchingService.findEligibleStudents(scholarshipId)));
    }

    // ---- Helpers ----

    private Long resolveStudentId(User user) {
        if ("STUDENT".equals(user.getRole().name())) {
            return studentRepository.findByUserId(user.getId())
                    .map(Student::getId)
                    .orElse(null);
        }
        return null;
    }
}
