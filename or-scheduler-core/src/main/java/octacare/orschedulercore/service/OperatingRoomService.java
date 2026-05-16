package octacare.orschedulercore.service;

import octacare.orschedulercore.entity.OperatingRoom;
import octacare.orschedulercore.entity.enums.RoomStatus;
import octacare.orschedulercore.repository.OperatingRoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class OperatingRoomService {

    private final OperatingRoomRepository operatingRoomRepository;

    public OperatingRoomService(OperatingRoomRepository operatingRoomRepository) {
        this.operatingRoomRepository = operatingRoomRepository;
    }

    public List<OperatingRoom> getAllRooms() {
        return operatingRoomRepository.findAll();
    }

    public OperatingRoom getRoomById(UUID id) {
        return operatingRoomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

    public List<OperatingRoom> getRoomsByStatus(RoomStatus status) {
        return operatingRoomRepository.findByStatus(status);
    }

    public OperatingRoom createRoom(OperatingRoom room) {
        if (operatingRoomRepository.existsByName(room.getName())) {
            throw new RuntimeException("Room with this name already exists");
        }
        return operatingRoomRepository.save(room);
    }

    public OperatingRoom updateRoom(UUID id, OperatingRoom roomData) {
        OperatingRoom existingRoom = getRoomById(id);
        
        existingRoom.setName(roomData.getName());
        existingRoom.setRoomType(roomData.getRoomType());
        existingRoom.setEquipment(roomData.getEquipment());
        existingRoom.setStatus(roomData.getStatus());
        existingRoom.setFloor(roomData.getFloor());
        existingRoom.setSterilizationTimeMinutes(roomData.getSterilizationTimeMinutes());
        existingRoom.setCapacity(roomData.getCapacity());
        
        return operatingRoomRepository.save(existingRoom);
    }

    public void deleteRoom(UUID id) {
        if (!operatingRoomRepository.existsById(id)) {
            throw new RuntimeException("Room not found");
        }
        operatingRoomRepository.deleteById(id);
    }
}
