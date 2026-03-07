package com.meritquest.scholarship.repository;

import com.meritquest.common.model.ApplicationStatus;
import com.meritquest.scholarship.entity.ScholarshipApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ScholarshipApplicationRepository extends JpaRepository<ScholarshipApplication, Long> {

    Page<ScholarshipApplication> findByScholarshipId(Long scholarshipId, Pageable pageable);

    Page<ScholarshipApplication> findByScholarshipIdAndStatus(Long scholarshipId, ApplicationStatus status, Pageable pageable);

    Page<ScholarshipApplication> findByStudentId(Long studentId, Pageable pageable);

    boolean existsByScholarshipIdAndStudentId(Long scholarshipId, Long studentId);

    Optional<ScholarshipApplication> findByScholarshipIdAndStudentId(Long scholarshipId, Long studentId);

    long countByScholarshipId(Long scholarshipId);

    long countByScholarshipIdAndStatus(Long scholarshipId, ApplicationStatus status);

    @Query("SELECT sa FROM ScholarshipApplication sa " +
           "JOIN FETCH sa.student s " +
           "JOIN FETCH s.institution " +
           "WHERE sa.id = :id")
    Optional<ScholarshipApplication> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT sa FROM ScholarshipApplication sa " +
           "JOIN FETCH sa.student s " +
           "JOIN FETCH s.institution " +
           "JOIN FETCH sa.scholarship " +
           "WHERE sa.scholarship.id = :scholarshipId " +
           "ORDER BY sa.meritScoreAtApplication DESC NULLS LAST")
    Page<ScholarshipApplication> findByScholarshipIdWithDetails(@Param("scholarshipId") Long scholarshipId, Pageable pageable);
}
