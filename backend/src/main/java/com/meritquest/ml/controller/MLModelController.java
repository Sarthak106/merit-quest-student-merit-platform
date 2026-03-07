package com.meritquest.ml.controller;

import com.meritquest.common.dto.ApiResponse;
import com.meritquest.ml.dto.MLModelVersionResponse;
import com.meritquest.ml.dto.MLServiceDto;
import com.meritquest.ml.service.MLModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/ml-models")
@RequiredArgsConstructor
public class MLModelController {

    private final MLModelService mlModelService;

    @PostMapping("/train")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<MLServiceDto.TrainResponse>> trainModel(
            @RequestParam(defaultValue = "random_forest") String modelType) {
        return ResponseEntity.ok(ApiResponse.success(mlModelService.trainModel(modelType)));
    }

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<MLModelVersionResponse>>> listModels(
            @RequestParam(required = false) String modelType) {
        return ResponseEntity.ok(ApiResponse.success(mlModelService.listModelVersions(modelType)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<MLModelVersionResponse>> getModel(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(mlModelService.getModelVersion(id)));
    }

    @GetMapping("/health")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkMLServiceHealth() {
        boolean healthy = mlModelService.isMLServiceHealthy();
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "mlServiceStatus", healthy ? "UP" : "DOWN",
                "healthy", healthy
        )));
    }
}
