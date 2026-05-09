package octacare.orschedulercore.repository;

import octacare.orschedulercore.entity.SterilizationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SterilizationLogRepository extends JpaRepository<SterilizationLog, UUID> {

    /** Toate logurile pentru o sală dată, ordonate descrescător după startTime. */
    List<SterilizationLog> findByRoom_IdOrderByStartTimeDesc(UUID roomId);
}
