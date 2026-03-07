package com.meritquest.scholarship.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplicationDecisionRequest {

    @NotNull(message = "Decision (approved) is required")
    private Boolean approved;

    private String comment;
}
