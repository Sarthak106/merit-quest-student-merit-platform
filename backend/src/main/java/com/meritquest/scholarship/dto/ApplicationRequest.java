package com.meritquest.scholarship.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplicationRequest {

    @NotNull(message = "Scholarship ID is required")
    private Long scholarshipId;

    private String statement;
}
