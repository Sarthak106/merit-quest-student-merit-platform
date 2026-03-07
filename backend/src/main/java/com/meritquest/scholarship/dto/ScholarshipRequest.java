package com.meritquest.scholarship.dto;

import com.meritquest.common.model.OrganizationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
public class ScholarshipRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Organization name is required")
    private String organizationName;

    @NotNull(message = "Organization type is required")
    private OrganizationType organizationType;

    private BigDecimal amount;

    private String currency;

    private Integer totalSlots;

    private Map<String, Object> eligibilityCriteria;

    private LocalDate applicationDeadline;

    private LocalDate startDate;

    private LocalDate endDate;
}
