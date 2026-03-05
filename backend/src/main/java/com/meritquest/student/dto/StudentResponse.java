package com.meritquest.student.dto;

import com.meritquest.common.model.Gender;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class StudentResponse {
    private Long id;
    private String enrollmentNumber;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String grade;
    private String section;
    private String guardianName;
    private String guardianPhone;
    private String guardianEmail;
    private String address;
    private Long institutionId;
    private String institutionName;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
