package com.meritquest.scholarship.dto;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class ScholarshipResponse implements Serializable {
    private Long id;
    private String title;
    private String description;
    private String organizationName;
    private String organizationType;
    private BigDecimal amount;
    private String currency;
    private Integer totalSlots;
    private Integer filledSlots;
    private Map<String, Object> eligibilityCriteria;
    private LocalDate applicationDeadline;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String postedByName;
    private Long postedById;
    private Long applicationCount;
    private Boolean hasApplied; // for student context
    private LocalDateTime createdAt;
}
