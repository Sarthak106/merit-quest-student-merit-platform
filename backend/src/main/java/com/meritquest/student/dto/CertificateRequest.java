package com.meritquest.student.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CertificateRequest {
    @NotNull  private Long studentId;
    @NotBlank private String title;
    private String issuingBody;
    private LocalDate issueDate;
}
