package octacare.orschedulercore.service;

import octacare.orschedulercore.entity.Patient;
import octacare.orschedulercore.repository.PatientRepository;
import org.springframework.stereotype.Service;
import java.util.UUID;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(UUID id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public Patient getPatientByUserId(UUID userId) {
        return patientRepository.findByUser_Id(userId)
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
        Patient existingPatient = getPatientById(id);

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
