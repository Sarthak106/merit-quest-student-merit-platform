package com.meritquest.scholarship.service;

import com.meritquest.common.exception.ResourceNotFoundException;
import com.meritquest.common.model.ApplicationStatus;
import com.meritquest.common.model.ScholarshipStatus;
import com.meritquest.merit.entity.MeritScore;
import com.meritquest.merit.repository.MeritScoreRepository;
import com.meritquest.scholarship.dto.*;
import com.meritquest.scholarship.entity.Scholarship;
import com.meritquest.scholarship.entity.ScholarshipApplication;
import com.meritquest.scholarship.repository.ScholarshipApplicationRepository;
import com.meritquest.scholarship.repository.ScholarshipRepository;
import com.meritquest.student.entity.Student;
import com.meritquest.student.repository.StudentRepository;
import com.meritquest.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScholarshipService {

    private final ScholarshipRepository scholarshipRepository;
    private final ScholarshipApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final MeritScoreRepository meritScoreRepository;

    // ---- Scholarship CRUD ----

    @Transactional
    public ScholarshipResponse createScholarship(ScholarshipRequest request, User user) {
        Scholarship scholarship = Scholarship.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .organizationName(request.getOrganizationName())
                .organizationType(request.getOrganizationType())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                .totalSlots(request.getTotalSlots())
                .eligibilityCriteria(request.getEligibilityCriteria() != null ? request.getEligibilityCriteria() : Map.of())
                .applicationDeadline(request.getApplicationDeadline())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(ScholarshipStatus.ACTIVE)
                .postedBy(user)
                .institution(user.getInstitution())
                .build();

        scholarship = scholarshipRepository.save(scholarship);
        return toResponse(scholarship, null, null);
    }

    @Transactional
    public ScholarshipResponse updateScholarship(Long id, ScholarshipRequest request, User user) {
        Scholarship scholarship = scholarshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scholarship not found"));

        // Only the poster or SYSTEM_ADMIN can update
        if (!scholarship.getPostedBy().getId().equals(user.getId())
                && !"SYSTEM_ADMIN".equals(user.getRole().name())) {
            throw new IllegalStateException("You are not authorized to update this scholarship");
        }

        scholarship.setTitle(request.getTitle());
        scholarship.setDescription(request.getDescription());
        scholarship.setOrganizationName(request.getOrganizationName());
        scholarship.setOrganizationType(request.getOrganizationType());
        if (request.getAmount() != null) scholarship.setAmount(request.getAmount());
        if (request.getCurrency() != null) scholarship.setCurrency(request.getCurrency());
        if (request.getTotalSlots() != null) scholarship.setTotalSlots(request.getTotalSlots());
        if (request.getEligibilityCriteria() != null) scholarship.setEligibilityCriteria(request.getEligibilityCriteria());
        if (request.getApplicationDeadline() != null) scholarship.setApplicationDeadline(request.getApplicationDeadline());
        if (request.getStartDate() != null) scholarship.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) scholarship.setEndDate(request.getEndDate());

        scholarship = scholarshipRepository.save(scholarship);
        long appCount = applicationRepository.countByScholarshipId(id);
        return toResponse(scholarship, appCount, null);
    }

    @Transactional
    public void closeScholarship(Long id, User user) {
        Scholarship scholarship = scholarshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scholarship not found"));

        if (!scholarship.getPostedBy().getId().equals(user.getId())
                && !"SYSTEM_ADMIN".equals(user.getRole().name())) {
            throw new IllegalStateException("You are not authorized to close this scholarship");
        }

        scholarship.setStatus(ScholarshipStatus.CLOSED);
        scholarshipRepository.save(scholarship);
    }

    public Page<ScholarshipResponse> listScholarships(ScholarshipStatus status, Pageable pageable, Long studentId) {
        Page<Scholarship> scholarships;
        if (status != null) {
            scholarships = scholarshipRepository.findByStatus(status, pageable);
        } else {
            scholarships = scholarshipRepository.findActiveScholarships(pageable);
        }
        return scholarships.map(s -> {
            long appCount = applicationRepository.countByScholarshipId(s.getId());
            Boolean hasApplied = studentId != null
                    ? applicationRepository.existsByScholarshipIdAndStudentId(s.getId(), studentId)
                    : null;
            return toResponse(s, appCount, hasApplied);
        });
    }

    public Page<ScholarshipResponse> listMyScholarships(Long userId, Pageable pageable) {
        return scholarshipRepository.findByPostedById(userId, pageable)
                .map(s -> {
                    long appCount = applicationRepository.countByScholarshipId(s.getId());
                    return toResponse(s, appCount, null);
                });
    }

    public ScholarshipResponse getScholarship(Long id, Long studentId) {
        Scholarship scholarship = scholarshipRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scholarship not found"));
        long appCount = applicationRepository.countByScholarshipId(id);
        Boolean hasApplied = studentId != null
                ? applicationRepository.existsByScholarshipIdAndStudentId(id, studentId)
                : null;
        return toResponse(scholarship, appCount, hasApplied);
    }

    // ---- Applications ----

    @Transactional
    public ApplicationResponse applyToScholarship(ApplicationRequest request, User user) {
        Scholarship scholarship = scholarshipRepository.findById(request.getScholarshipId())
                .orElseThrow(() -> new ResourceNotFoundException("Scholarship not found"));

        if (scholarship.getStatus() != ScholarshipStatus.ACTIVE) {
            throw new IllegalStateException("This scholarship is no longer accepting applications");
        }

        if (scholarship.getApplicationDeadline() != null
                && scholarship.getApplicationDeadline().isBefore(java.time.LocalDate.now())) {
            throw new IllegalStateException("Application deadline has passed");
        }

        if (scholarship.getTotalSlots() != null && scholarship.getFilledSlots() >= scholarship.getTotalSlots()) {
            throw new IllegalStateException("All slots have been filled");
        }

        // Find the student linked to this user
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("No student profile linked to your account"));

        if (applicationRepository.existsByScholarshipIdAndStudentId(scholarship.getId(), student.getId())) {
            throw new IllegalStateException("You have already applied to this scholarship");
        }

        // Fetch latest merit score for eligibility snapshot
        BigDecimal currentScore = getLatestCompositeScore(student.getId());

        ScholarshipApplication application = ScholarshipApplication.builder()
                .scholarship(scholarship)
                .student(student)
                .statement(request.getStatement())
                .meritScoreAtApplication(currentScore)
                .status(ApplicationStatus.PENDING)
                .build();

        application = applicationRepository.save(application);
        return toApplicationResponse(application);
    }

    @Transactional
    public ApplicationResponse decideApplication(Long applicationId, ApplicationDecisionRequest request, User user) {
        ScholarshipApplication application = applicationRepository.findByIdWithDetails(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        Scholarship scholarship = application.getScholarship();

        // Only poster or SYSTEM_ADMIN can decide
        if (!scholarship.getPostedBy().getId().equals(user.getId())
                && !"SYSTEM_ADMIN".equals(user.getRole().name())) {
            throw new IllegalStateException("You are not authorized to review this application");
        }

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalStateException("Application has already been decided");
        }

        if (Boolean.TRUE.equals(request.getApproved())) {
            // Check slots before approving
            if (scholarship.getTotalSlots() != null && scholarship.getFilledSlots() >= scholarship.getTotalSlots()) {
                throw new IllegalStateException("All scholarship slots are already filled");
            }
            application.setStatus(ApplicationStatus.APPROVED);
            scholarship.setFilledSlots(scholarship.getFilledSlots() + 1);
            scholarshipRepository.save(scholarship);
        } else {
            application.setStatus(ApplicationStatus.REJECTED);
        }

        application.setReviewer(user);
        application.setReviewerComment(request.getComment());
        application.setReviewedAt(LocalDateTime.now());

        application = applicationRepository.save(application);
        return toApplicationResponse(application);
    }

    @Transactional
    public void withdrawApplication(Long scholarshipId, User user) {
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("No student profile linked to your account"));

        ScholarshipApplication application = applicationRepository
                .findByScholarshipIdAndStudentId(scholarshipId, student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalStateException("Only pending applications can be withdrawn");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        applicationRepository.save(application);
    }

    public Page<ApplicationResponse> getApplicationsForScholarship(Long scholarshipId, Pageable pageable) {
        return applicationRepository.findByScholarshipIdWithDetails(scholarshipId, pageable)
                .map(this::toApplicationResponse);
    }

    public Page<ApplicationResponse> getMyApplications(User user, Pageable pageable) {
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("No student profile linked to your account"));
        return applicationRepository.findByStudentId(student.getId(), pageable)
                .map(this::toApplicationResponse);
    }

    // ---- Helpers ----

    private BigDecimal getLatestCompositeScore(Long studentId) {
        List<MeritScore> scores = meritScoreRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        if (scores.isEmpty()) return null;
        return scores.get(0).getCompositeScore();
    }

    private ScholarshipResponse toResponse(Scholarship s, Long applicationCount, Boolean hasApplied) {
        return ScholarshipResponse.builder()
                .id(s.getId())
                .title(s.getTitle())
                .description(s.getDescription())
                .organizationName(s.getOrganizationName())
                .organizationType(s.getOrganizationType().name())
                .amount(s.getAmount())
                .currency(s.getCurrency())
                .totalSlots(s.getTotalSlots())
                .filledSlots(s.getFilledSlots())
                .eligibilityCriteria(s.getEligibilityCriteria())
                .applicationDeadline(s.getApplicationDeadline())
                .startDate(s.getStartDate())
                .endDate(s.getEndDate())
                .status(s.getStatus().name())
                .postedByName(s.getPostedBy().getFirstName() + " " + s.getPostedBy().getLastName())
                .postedById(s.getPostedBy().getId())
                .applicationCount(applicationCount)
                .hasApplied(hasApplied)
                .createdAt(s.getCreatedAt())
                .build();
    }

    private ApplicationResponse toApplicationResponse(ScholarshipApplication a) {
        Student s = a.getStudent();
        return ApplicationResponse.builder()
                .id(a.getId())
                .scholarshipId(a.getScholarship().getId())
                .scholarshipTitle(a.getScholarship().getTitle())
                .studentId(s.getId())
                .studentName(s.getFirstName() + " " + s.getLastName())
                .enrollmentNumber(s.getEnrollmentNumber())
                .grade(s.getGrade())
                .institutionName(s.getInstitution() != null ? s.getInstitution().getName() : null)
                .meritScoreAtApplication(a.getMeritScoreAtApplication())
                .statement(a.getStatement())
                .status(a.getStatus().name())
                .reviewerName(a.getReviewer() != null
                        ? a.getReviewer().getFirstName() + " " + a.getReviewer().getLastName()
                        : null)
                .reviewerComment(a.getReviewerComment())
                .reviewedAt(a.getReviewedAt())
                .appliedAt(a.getAppliedAt())
                .build();
    }
}
