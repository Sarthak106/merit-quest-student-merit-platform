package com.meritquest.student.service;

import com.meritquest.common.exception.ResourceNotFoundException;
import com.meritquest.storage.StorageService;
import com.meritquest.student.dto.CertificateRequest;
import com.meritquest.student.dto.CertificateResponse;
import com.meritquest.student.entity.Certificate;
import com.meritquest.student.entity.Student;
import com.meritquest.student.repository.CertificateRepository;
import com.meritquest.student.repository.StudentRepository;
import com.meritquest.user.entity.Institution;
import com.meritquest.user.repository.InstitutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final StudentRepository studentRepository;
    private final InstitutionRepository institutionRepository;
    private final StorageService storageService;

    @Transactional
    public CertificateResponse uploadCertificate(CertificateRequest request, MultipartFile file, Long institutionId) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + request.getStudentId()));

        if (!student.getInstitution().getId().equals(institutionId)) {
            throw new ResourceNotFoundException("Student not found: " + request.getStudentId());
        }

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found: " + institutionId));

        String fileKey = storageService.upload(file, "certificates/" + institutionId);

        Certificate cert = Certificate.builder()
                .student(student)
                .title(request.getTitle())
                .issuingBody(request.getIssuingBody())
                .issueDate(request.getIssueDate())
                .fileKey(fileKey)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .institution(institution)
                .build();

        return toResponse(certificateRepository.save(cert));
    }

    @Transactional(readOnly = true)
    public List<CertificateResponse> getCertificatesByStudent(Long studentId, Long institutionId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        if (!student.getInstitution().getId().equals(institutionId)) {
            throw new ResourceNotFoundException("Student not found: " + studentId);
        }
        return certificateRepository.findByStudentId(studentId).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public String getDownloadUrl(Long certId, Long institutionId) {
        Certificate cert = certificateRepository.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found: " + certId));
        if (!cert.getInstitution().getId().equals(institutionId)) {
            throw new ResourceNotFoundException("Certificate not found: " + certId);
        }
        return storageService.getPresignedUrl(cert.getFileKey(), 60);
    }

    @Transactional
    public void deleteCertificate(Long certId, Long institutionId) {
        Certificate cert = certificateRepository.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found: " + certId));
        if (!cert.getInstitution().getId().equals(institutionId)) {
            throw new ResourceNotFoundException("Certificate not found: " + certId);
        }
        storageService.delete(cert.getFileKey());
        certificateRepository.delete(cert);
    }

    private CertificateResponse toResponse(Certificate c) {
        String downloadUrl = storageService.getPresignedUrl(c.getFileKey(), 60);
        return CertificateResponse.builder()
                .id(c.getId())
                .studentId(c.getStudent().getId())
                .studentName(c.getStudent().getFirstName() + " " + c.getStudent().getLastName())
                .title(c.getTitle())
                .issuingBody(c.getIssuingBody())
                .issueDate(c.getIssueDate())
                .fileName(c.getFileName())
                .fileSize(c.getFileSize())
                .downloadUrl(downloadUrl)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
