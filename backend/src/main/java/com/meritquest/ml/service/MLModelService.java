package com.meritquest.ml.service;

import com.meritquest.ml.dto.MLModelVersionResponse;
import com.meritquest.ml.dto.MLServiceDto;
import com.meritquest.ml.entity.MLModelVersion;
import com.meritquest.ml.repository.MLModelVersionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MLModelService {

    private final MLModelVersionRepository modelVersionRepository;
    private final MLServiceClient mlServiceClient;

    public MLServiceDto.TrainResponse trainModel(String modelType) {
        MLServiceDto.TrainResponse response = mlServiceClient.trainModel(modelType);
        log.info("Trained model {} v{} — F1: {}, AUC-ROC: {}",
                response.getModelType(), response.getVersion(),
                response.getMetrics().get("f1_score"),
                response.getMetrics().get("auc_roc"));
        return response;
    }

    public List<MLModelVersionResponse> listModelVersions(String modelType) {
        List<MLModelVersion> versions;
        if (modelType != null) {
            versions = modelVersionRepository.findByModelTypeOrderByVersionDesc(modelType);
        } else {
            versions = modelVersionRepository.findAllByOrderByModelTypeAscVersionDesc();
        }
        return versions.stream().map(this::toResponse).toList();
    }

    public MLModelVersionResponse getModelVersion(Long id) {
        return modelVersionRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Model version not found: " + id));
    }

    public boolean isMLServiceHealthy() {
        return mlServiceClient.isHealthy();
    }

    private MLModelVersionResponse toResponse(MLModelVersion mv) {
        return MLModelVersionResponse.builder()
                .id(mv.getId())
                .modelType(mv.getModelType())
                .version(mv.getVersion())
                .fileKey(mv.getFileKey())
                .metrics(mv.getMetrics())
                .featureImportances(mv.getFeatureImportances())
                .trainingSamples(mv.getTrainingSamples())
                .featureCount(mv.getFeatureCount())
                .trainedAt(mv.getTrainedAt())
                .build();
    }
}
