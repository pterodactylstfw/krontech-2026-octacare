package octacare.orschedulercore.repository;

import octacare.orschedulercore.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    @Query("select p from Patient p join fetch p.user")
    java.util.List<Patient> findAllWithUser();

    @Query("select p from Patient p join fetch p.user where p.id = :id")
    Optional<Patient> findByIdWithUser(@Param("id") UUID id);

    @Query("select p from Patient p join fetch p.user where p.user.id = :userId")
    Optional<Patient> findByUserIdWithUser(@Param("userId") UUID userId);

    @Query("select p from Patient p where p.user.id = :userId")
    Optional<Patient> findByUserId(@Param("userId") UUID userId);


    boolean existsByUser_Id(UUID userId);

    boolean existsByMedicalRecordNumber(String mrn);
}
