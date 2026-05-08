package octacare.orschedulercore.repository;

import octacare.orschedulercore.entity.Surgery;
import octacare.orschedulercore.entity.enums.SurgeryPriority;
import octacare.orschedulercore.entity.enums.SurgeryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SurgeryRepository extends JpaRepository<Surgery, UUID> {

    List<Surgery> findBySurgeon_Id(String surgeonId);

    List<Surgery> findByPatient_Id(UUID patientId);

    List<Surgery> findByRoomId(UUID roomId);

    List<Surgery> findByStatus(SurgeryStatus status);

    List<Surgery> findByPriority(SurgeryPriority priority);

    List<Surgery> findByScheduledStartBetween(LocalDateTime start, LocalDateTime end);
}
