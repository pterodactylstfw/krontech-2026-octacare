package octacare.orschedulercore.controller;

import octacare.orschedulercore.entity.OperatingRoom;
import octacare.orschedulercore.entity.enums.RoomStatus;
import octacare.orschedulercore.service.OperatingRoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin
public class OperatingRoomController {

    private final OperatingRoomService operatingRoomService;

    public OperatingRoomController(OperatingRoomService operatingRoomService) {
        this.operatingRoomService = operatingRoomService;
    }

    @GetMapping
    public ResponseEntity<List<OperatingRoom>> getAllRooms(@RequestParam(required = false) RoomStatus status) {
        if (status != null) {
            return ResponseEntity.ok(operatingRoomService.getRoomsByStatus(status));
        }
        return ResponseEntity.ok(operatingRoomService.getAllRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OperatingRoom> getRoomById(@PathVariable UUID id) {
        return ResponseEntity.ok(operatingRoomService.getRoomById(id));
    }

    @PostMapping
    public ResponseEntity<OperatingRoom> createRoom(@RequestBody OperatingRoom room) {
        OperatingRoom createdRoom = operatingRoomService.createRoom(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRoom);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OperatingRoom> updateRoom(@PathVariable UUID id, @RequestBody OperatingRoom room) {
        return ResponseEntity.ok(operatingRoomService.updateRoom(id, room));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable UUID id) {
        operatingRoomService.deleteRoom(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        if ("Room not found".equals(ex.getMessage())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
        if ("Room with this name already exists".equals(ex.getMessage())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage()); // 409 Conflict
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
    }
}
