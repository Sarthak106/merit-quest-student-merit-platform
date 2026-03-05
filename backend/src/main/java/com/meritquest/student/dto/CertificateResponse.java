package com.meritquest.student.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class CertificateResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String title;
    private String issuingBody;
    private LocalDate issueDate;
    private String fileName;
    private Long fileSize;
    private String downloadUrl;
    private LocalDateTime createdAt;
}
