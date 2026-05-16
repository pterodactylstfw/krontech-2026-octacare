package octacare.orschedulercore.service;

import octacare.orschedulercore.dto.PatientResponse;
import octacare.orschedulercore.entity.Patient;
import octacare.orschedulercore.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    // Helper to load the entity when we need to mutate it. Service exposes DTO-returning
    // getters for controllers, but create/update/delete still operate on the entity.
    private Patient findEntityById(UUID id) {
        return patientRepository.findByIdWithUser(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public List<PatientResponse> getAllPatients() {
        return patientRepository.findAllWithUser().stream()
                .map(PatientResponse::from)
                .collect(Collectors.toList());
    }

    public PatientResponse getPatientById(UUID id) {
        return patientRepository.findByIdWithUser(id)
                .map(PatientResponse::from)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public PatientResponse getPatientByUserId(UUID userId) {
        return patientRepository.findByUserIdWithUser(userId)
                .map(PatientResponse::from)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public Patient createPatient(Patient patient) {
        if (patient.getUser() != null && patient.getUser().getId() != null) {
            if (patientRepository.existsByUser_Id(patient.getUser().getId())) {
                throw new RuntimeException("User already has a patient profile");
            }
        }

        if (patient.getMedicalRecordNumber() != null && !patient.getMedicalRecordNumber().trim().isEmpty()) {
            if (patientRepository.existsByMedicalRecordNumber(patient.getMedicalRecordNumber())) {
                throw new RuntimeException("Medical record number already exists");
            }
        }

        return patientRepository.save(patient);
    }

    public Patient updatePatient(UUID id, Patient patientData) {
        Patient existingPatient = findEntityById(id);

        if (patientData.getMedicalRecordNumber() != null && !patientData.getMedicalRecordNumber().trim().isEmpty()) {
            if (!patientData.getMedicalRecordNumber().equals(existingPatient.getMedicalRecordNumber()) &&
                    patientRepository.existsByMedicalRecordNumber(patientData.getMedicalRecordNumber())) {
                throw new RuntimeException("Medical record number already exists");
            }
            existingPatient.setMedicalRecordNumber(patientData.getMedicalRecordNumber());
        } else {
            existingPatient.setMedicalRecordNumber(patientData.getMedicalRecordNumber());
        }

        existingPatient.setDateOfBirth(patientData.getDateOfBirth());
        existingPatient.setBloodType(patientData.getBloodType());

        return patientRepository.save(existingPatient);
    }

    public void deletePatient(UUID id) {
        if (!patientRepository.existsById(id)) {
            throw new RuntimeException("Patient not found");
        }
        patientRepository.deleteById(id);
    }
}
