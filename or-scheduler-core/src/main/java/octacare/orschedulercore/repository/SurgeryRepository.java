package octacare.orschedulercore.repository;

import octacare.orschedulercore.entity.Surgery;
import octacare.orschedulercore.entity.enums.SurgeryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SurgeryRepository extends JpaRepository<Surgery, Long> {

    // Toate operațiile dintr-o zi 
    List<Surgery> findByScheduledStartBetween(LocalDateTime start, LocalDateTime end);

    // Operațiile unui chirurg dintr-o zi
    List<Surgery> findBySurgeonIdAndScheduledStartBetween(Long surgeonId, LocalDateTime start, LocalDateTime end);

    // Operațiile unui pacient
    List<Surgery> findByPatientId(Long patientId);

    // Operațiile unui pacient care urmează
    List<Surgery> findByPatientIdAndScheduledStartAfterOrderByScheduledStartAsc(Long patientId, LocalDateTime after);

    // Număr de operații dintr-o zi după status
    @Query("SELECT COUNT(s) FROM Surgery s WHERE s.scheduledStart BETWEEN :start AND :end AND s.status = :status")
    long countByDateAndStatus(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("status") SurgeryStatus status);

    // Număr total de operații dintr-o zi
    @Query("SELECT COUNT(s) FROM Surgery s WHERE s.scheduledStart BETWEEN :start AND :end")
    long countByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
