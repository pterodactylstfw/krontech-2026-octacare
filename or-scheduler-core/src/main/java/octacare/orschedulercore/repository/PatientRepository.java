package octacare.orschedulercore.repository;

import octacare.orschedulercore.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByUserId(UUID userId);

    Optional<Patient> findByUser_Id(UUID userId);

    Optional<Patient> findByMedicalRecordNumber(String mrn);

    boolean existsByUser_Id(UUID userId);

    boolean existsByMedicalRecordNumber(String mrn);
}
