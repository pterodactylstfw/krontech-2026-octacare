package octacare.orschedulercore.repository;

import octacare.orschedulercore.entity.SurgeonAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface SurgeonAvailabilityRepository extends JpaRepository<SurgeonAvailability, UUID> {

    List<SurgeonAvailability> findBySurgeon_IdOrderByDateAscStartTimeAsc(UUID surgeonId);

    List<SurgeonAvailability> findBySurgeon_IdAndDateBetweenOrderByDateAscStartTimeAsc(
            UUID surgeonId,
            LocalDate startDate,
            LocalDate endDate);

    List<SurgeonAvailability> findByDateOrderByStartTimeAsc(LocalDate date);

    List<SurgeonAvailability> findByDateBetweenOrderByDateAscStartTimeAsc(
            LocalDate startDate,
            LocalDate endDate);

    @Query("""
            select count(sa) > 0
            from SurgeonAvailability sa
            where sa.surgeon.id = :surgeonId
              and sa.date = :date
              and (:excludeId is null or sa.id <> :excludeId)
              and (sa.startTime < :endTime and sa.endTime > :startTime)
            """)
    boolean existsOverlap(
            @Param("surgeonId") UUID surgeonId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") UUID excludeId);
}
