package com.meritquest.ml.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MLModelVersionResponse {
    private Long id;
    private String modelType;
    private Integer version;
    private String fileKey;
    private Map<String, Object> metrics;
    private Map<String, Object> featureImportances;
    private Integer trainingSamples;
    private Integer featureCount;
    private LocalDateTime trainedAt;
}
