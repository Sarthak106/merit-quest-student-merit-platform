package com.meritquest.student.repository;

import com.meritquest.student.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Page<Student> findByInstitutionId(Long institutionId, Pageable pageable);
    Page<Student> findByInstitutionIdAndGrade(Long institutionId, String grade, Pageable pageable);
    Optional<Student> findByEnrollmentNumberAndInstitutionId(String enrollmentNumber, Long institutionId);
    boolean existsByEnrollmentNumberAndInstitutionId(String enrollmentNumber, Long institutionId);
    long countByInstitutionId(Long institutionId);
}
