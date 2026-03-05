package com.meritquest.student.repository;

import com.meritquest.student.entity.BulkUpload;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BulkUploadRepository extends JpaRepository<BulkUpload, Long> {
    Page<BulkUpload> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId, Pageable pageable);
}
