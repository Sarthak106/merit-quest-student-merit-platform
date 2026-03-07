package com.meritquest.ml.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meritquest.ml.dto.MLServiceDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * REST client that talks to the Python ML microservice.
 */
@Slf4j
@Service
public class MLServiceClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MLServiceClient(@Value("${app.ml-service.base-url:http://localhost:5000}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public MLServiceDto.PredictionResponse predictDropoutRisk(Long studentId) {
        return postJson("/predict/dropout-risk", Map.of("student_id", studentId), MLServiceDto.PredictionResponse.class);
    }

    public MLServiceDto.PredictionResponse predictDropoutRiskBatch(Long institutionId) {
        var body = institutionId != null ? Map.of("institution_id", institutionId) : Map.of();
        return postJson("/predict/dropout-risk/batch", body, MLServiceDto.PredictionResponse.class);
    }

    public MLServiceDto.TrainResponse trainModel(String modelType) {
        return postJson("/train", Map.of("model_type", modelType), MLServiceDto.TrainResponse.class);
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> listModels(String modelType) {
        String uri = modelType != null ? "/models?model_type=" + modelType : "/models";
        return restClient.get()
                .uri(uri)
                .retrieve()
                .body(List.class);
    }

    public boolean isHealthy() {
        try {
            var resp = restClient.get().uri("/health").retrieve().body(Map.class);
            return resp != null && "UP".equals(resp.get("status"));
        } catch (Exception e) {
            log.warn("ML service health check failed: {}", e.getMessage());
            return false;
        }
    }

    private <T> T postJson(String uri, Object requestBody, Class<T> responseType) {
        try {
            byte[] jsonBytes = objectMapper.writeValueAsBytes(requestBody);
            return restClient.post()
                    .uri(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(jsonBytes)
                    .retrieve()
                    .body(responseType);
        } catch (Exception e) {
            throw new RuntimeException("ML service call to " + uri + " failed: " + e.getMessage(), e);
        }
    }
}
