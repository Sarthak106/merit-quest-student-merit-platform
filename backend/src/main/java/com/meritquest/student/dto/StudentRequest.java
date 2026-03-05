package com.meritquest.student.dto;

import com.meritquest.common.model.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StudentRequest {
    @NotBlank private String enrollmentNumber;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotNull  private LocalDate dateOfBirth;
    @NotNull  private Gender gender;
    @NotBlank private String grade;
    private String section;
    private String guardianName;
    private String guardianPhone;
    private String guardianEmail;
    private String address;
}
