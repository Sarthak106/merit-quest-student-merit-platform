package com.meritquest.scholarship.service;

import com.meritquest.common.model.VerificationStatus;
import com.meritquest.merit.entity.MeritScore;
import com.meritquest.merit.repository.MeritScoreRepository;
import com.meritquest.scholarship.dto.EligibleStudentsResponse;
import com.meritquest.scholarship.entity.Scholarship;
import com.meritquest.scholarship.repository.ScholarshipApplicationRepository;
import com.meritquest.scholarship.repository.ScholarshipRepository;
import com.meritquest.common.exception.ResourceNotFoundException;
import com.meritquest.student.entity.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScholarshipMatchingService {

    private final ScholarshipRepository scholarshipRepository;
    private final ScholarshipApplicationRepository applicationRepository;
    private final MeritScoreRepository meritScoreRepository;

    /**
     * Find all students eligible for a given scholarship based on its JSON eligibility criteria.
     * Criteria fields: minCompositeScore, grades, districts, boards
     */
    public EligibleStudentsResponse findEligibleStudents(Long scholarshipId) {
        Scholarship scholarship = scholarshipRepository.findByIdWithDetails(scholarshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Scholarship not found"));

        Map<String, Object> criteria = scholarship.getEligibilityCriteria();

        // Fetch all merit scores with student + institution eagerly loaded
        List<MeritScore> allScores = meritScoreRepository.findAllWithStudentAndInstitution();

        // Deduplicate: keep only latest score per student
        Map<Long, MeritScore> latestScores = allScores.stream()
                .collect(Collectors.toMap(
                        ms -> ms.getStudent().getId(),
                        ms -> ms,
                        (a, b) -> a.getCreatedAt().isAfter(b.getCreatedAt()) ? a : b
                ));

        // Apply eligibility filters
        List<EligibleStudentsResponse.EligibleStudent> eligible = latestScores.values().stream()
                .filter(ms -> isStudentEligible(ms, criteria))
                .sorted(Comparator.comparing(ms -> ms.getCompositeScore().doubleValue(), Comparator.reverseOrder()))
                .map(ms -> {
                    Student s = ms.getStudent();
                    boolean alreadyApplied = applicationRepository
                            .existsByScholarshipIdAndStudentId(scholarshipId, s.getId());
                    return EligibleStudentsResponse.EligibleStudent.builder()
                            .studentId(s.getId())
                            .enrollmentNumber(s.getEnrollmentNumber())
                            .studentName(s.getFirstName() + " " + s.getLastName())
                            .grade(s.getGrade())
                            .institutionName(s.getInstitution().getName())
                            .compositeScore(ms.getCompositeScore().doubleValue())
                            .alreadyApplied(alreadyApplied)
                            .build();
                })
                .toList();

        return EligibleStudentsResponse.builder()
                .scholarshipId(scholarshipId)
                .scholarshipTitle(scholarship.getTitle())
                .totalEligible(eligible.size())
                .students(eligible)
                .build();
    }

    @SuppressWarnings("unchecked")
    private boolean isStudentEligible(MeritScore ms, Map<String, Object> criteria) {
        Student student = ms.getStudent();

        // Only approved students
        if (student.getVerificationStatus() != VerificationStatus.APPROVED) {
            return false;
        }

        // Only active students
        if (!Boolean.TRUE.equals(student.getActive())) {
            return false;
        }

        // Min composite score
        if (criteria.containsKey("minCompositeScore")) {
            double min = toDouble(criteria.get("minCompositeScore"));
            if (ms.getCompositeScore().doubleValue() < min) {
                return false;
            }
        }

        // Grade filter
        if (criteria.containsKey("grades")) {
            List<String> grades = toStringList(criteria.get("grades"));
            if (!grades.isEmpty() && !grades.contains(student.getGrade())) {
                return false;
            }
        }

        // District filter
        if (criteria.containsKey("districts")) {
            List<String> districts = toStringList(criteria.get("districts"));
            if (!districts.isEmpty() && !districts.contains(student.getInstitution().getDistrict())) {
                return false;
            }
        }

        // Board filter
        if (criteria.containsKey("boards")) {
            List<String> boards = toStringList(criteria.get("boards"));
            if (!boards.isEmpty() && student.getInstitution().getBoard() != null
                    && !boards.contains(student.getInstitution().getBoard())) {
                return false;
            }
        }

        return true;
    }

    private double toDouble(Object value) {
        if (value instanceof Number n) return n.doubleValue();
        return Double.parseDouble(String.valueOf(value));
    }

    @SuppressWarnings("unchecked")
    private List<String> toStringList(Object value) {
        if (value instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return List.of();
    }
}
