package octacare.orschedulercore.repository;

import octacare.orschedulercore.entity.OperatingRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OperatingRoomRepository extends JpaRepository<OperatingRoom, UUID> {
    Optional<OperatingRoom> findByNameIgnoreCase(String name);

    List<OperatingRoom> findByStatus(RoomStatus status);

    List<OperatingRoom> findByRoomType(RoomType roomType);

    List<OperatingRoom> findByStatusAndRoomType(RoomStatus status, RoomType roomType);

    boolean existsByName(String name);
}
