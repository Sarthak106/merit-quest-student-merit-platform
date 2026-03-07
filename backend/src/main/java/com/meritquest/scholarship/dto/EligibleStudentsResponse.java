package com.meritquest.scholarship.dto;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
public class EligibleStudentsResponse implements Serializable {
    private Long scholarshipId;
    private String scholarshipTitle;
    private int totalEligible;
    private List<EligibleStudent> students;

    @Data
    @Builder
    public static class EligibleStudent implements Serializable {
        private Long studentId;
        private String enrollmentNumber;
        private String studentName;
        private String grade;
        private String institutionName;
        private double compositeScore;
        private boolean alreadyApplied;
    }
}
