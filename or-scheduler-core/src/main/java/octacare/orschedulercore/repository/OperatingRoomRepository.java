package octacare.orschedulercore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import octacare.orschedulercore.entity.OperatingRoom;
import octacare.orschedulercore.entity.enums.RoomStatus;
import octacare.orschedulercore.entity.enums.RoomType;

import java.util.List;
import java.util.UUID;

@Repository
public interface OperatingRoomRepository extends JpaRepository<OperatingRoom, UUID> {

    List<OperatingRoom> findByStatus(RoomStatus status);

    List<OperatingRoom> findByRoomType(RoomType roomType);

    List<OperatingRoom> findByStatusAndRoomType(RoomStatus status, RoomType roomType);

    boolean existsByName(String name);
}
