package octacare.orschedulercore.dto;

import octacare.orschedulercore.entity.Patient;
import octacare.orschedulercore.entity.User;

import java.time.LocalDate;
import java.util.UUID;

public record PatientResponse(
        UUID id,
        UUID userId,
        String fullName,
        String email,
        String phone,
        String medicalRecordNumber,
        LocalDate dateOfBirth,
        String bloodType
) {
    public static PatientResponse from(Patient patient) {
        User user = patient.getUser();
        return new PatientResponse(
                patient.getId(),
                user != null ? user.getId() : null,
                user != null ? user.getFullName() : null,
                user != null ? user.getEmail() : null,
                user != null ? user.getPhone() : null,
                patient.getMedicalRecordNumber(),
                patient.getDateOfBirth(),
                patient.getBloodType()
        );
    }
}

