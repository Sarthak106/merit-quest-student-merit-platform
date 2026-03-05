package com.meritquest.student.dto;

import com.meritquest.common.model.UploadStatus;
import com.meritquest.common.model.UploadType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class BulkUploadResponse {
    private Long id;
    private String fileName;
    private UploadType uploadType;
    private UploadStatus status;
    private Integer totalRows;
    private Integer successRows;
    private Integer failedRows;
    private Map<String, Object> errorDetails;
    private LocalDateTime createdAt;
}
