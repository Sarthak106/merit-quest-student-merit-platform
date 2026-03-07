package com.meritquest.ml.repository;

import com.meritquest.ml.entity.MLModelVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MLModelVersionRepository extends JpaRepository<MLModelVersion, Long> {

    List<MLModelVersion> findByModelTypeOrderByVersionDesc(String modelType);

    Optional<MLModelVersion> findByModelTypeAndVersion(String modelType, Integer version);

    Optional<MLModelVersion> findTopByModelTypeOrderByVersionDesc(String modelType);

    List<MLModelVersion> findAllByOrderByModelTypeAscVersionDesc();
}
