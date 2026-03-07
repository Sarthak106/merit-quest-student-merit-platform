package com.meritquest.scholarship.repository;

import com.meritquest.common.model.ScholarshipStatus;
import com.meritquest.scholarship.entity.Scholarship;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ScholarshipRepository extends JpaRepository<Scholarship, Long> {

    Page<Scholarship> findByStatus(ScholarshipStatus status, Pageable pageable);

    Page<Scholarship> findByPostedById(Long userId, Pageable pageable);

    @Query("SELECT s FROM Scholarship s " +
           "JOIN FETCH s.postedBy " +
           "LEFT JOIN FETCH s.institution " +
           "WHERE s.id = :id")
    Optional<Scholarship> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT s FROM Scholarship s WHERE s.status = 'ACTIVE' " +
           "AND (s.applicationDeadline IS NULL OR s.applicationDeadline >= CURRENT_DATE)")
    Page<Scholarship> findActiveScholarships(Pageable pageable);

    @Query("SELECT s FROM Scholarship s WHERE s.status = 'ACTIVE' " +
           "AND (s.applicationDeadline IS NULL OR s.applicationDeadline >= CURRENT_DATE) " +
           "AND s.postedBy.id = :userId")
    Page<Scholarship> findActiveByPostedById(@Param("userId") Long userId, Pageable pageable);

    long countByPostedById(Long userId);

    long countByStatus(ScholarshipStatus status);
}
