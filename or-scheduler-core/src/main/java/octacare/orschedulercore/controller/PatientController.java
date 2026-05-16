package octacare.orschedulercore.controller;

import octacare.orschedulercore.dto.PatientResponse;
import octacare.orschedulercore.entity.Patient;
import octacare.orschedulercore.service.PatientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public ResponseEntity<List<PatientResponse>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponse> getPatientById(@PathVariable UUID id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<PatientResponse> getPatientByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(patientService.getPatientByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<PatientResponse> createPatient(@RequestBody Patient patient) {
        Patient createdPatient = patientService.createPatient(patient);
        return ResponseEntity.status(HttpStatus.CREATED).body(PatientResponse.from(createdPatient));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientResponse> updatePatient(@PathVariable UUID id, @RequestBody Patient patient) {
        return ResponseEntity.ok(PatientResponse.from(patientService.updatePatient(id, patient)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable UUID id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception ex) {
        if (ex instanceof RuntimeException) {
            if ("Patient not found".equals(ex.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
            }
            if ("User already has a patient profile".equals(ex.getMessage()) ||
                "Medical record number already exists".equals(ex.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
            }
        }
        // Return detailed error for debugging
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ex.getClass().getSimpleName() + ": " + ex.getMessage());
    }
}
