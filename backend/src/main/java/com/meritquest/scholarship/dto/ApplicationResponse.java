package com.meritquest.scholarship.dto;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ApplicationResponse implements Serializable {
    private Long id;
    private Long scholarshipId;
    private String scholarshipTitle;
    private Long studentId;
    private String studentName;
    private String enrollmentNumber;
    private String grade;
    private String institutionName;
    private BigDecimal meritScoreAtApplication;
    private String statement;
    private String status;
    private String reviewerName;
    private String reviewerComment;
    private LocalDateTime reviewedAt;
    private LocalDateTime appliedAt;
}
