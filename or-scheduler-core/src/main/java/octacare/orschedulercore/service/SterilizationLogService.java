package octacare.orschedulercore.service;

import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.SterilizationLogRequest;
import octacare.orschedulercore.dto.SterilizationLogResponse;
import octacare.orschedulercore.entity.OperatingRoom;
import octacare.orschedulercore.entity.SterilizationLog;
import octacare.orschedulercore.entity.User;
import octacare.orschedulercore.entity.enums.RoomStatus;
import octacare.orschedulercore.entity.enums.SterilizationStatus;
import octacare.orschedulercore.repository.OperatingRoomRepository;
import octacare.orschedulercore.repository.SterilizationLogRepository;
import octacare.orschedulercore.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SterilizationLogService {

    private final SterilizationLogRepository sterilizationLogRepository;
    private final OperatingRoomRepository operatingRoomRepository;
    private final UserRepository userRepository;

    // -------------------------------------------------------------------------
    // Queries
    // -------------------------------------------------------------------------

    /** Returnează toate logurile de sterilizare, ordonate descrescător după ID. */
    public List<SterilizationLogResponse> getAll() {
        return sterilizationLogRepository.findAll()
                .stream()
                .map(SterilizationLogResponse::from)
                .toList();
    }

    /** Returnează logurile de sterilizare pentru o sală specifică. */
    public List<SterilizationLogResponse> getByRoom(UUID roomId) {
        if (!operatingRoomRepository.existsById(roomId)) {
            throw new RuntimeException("Sala cu id=" + roomId + " nu există.");
        }
        return sterilizationLogRepository.findByRoom_IdOrderByStartTimeDesc(roomId)
                .stream()
                .map(SterilizationLogResponse::from)
                .toList();
    }

    // -------------------------------------------------------------------------
    // Commands
    // -------------------------------------------------------------------------

    /**
     * Creează un nou log de sterilizare și marchează sala ca STERILIZING.
     * Un singur log IN_PROGRESS per sală este permis la un moment dat.
     */
    @Transactional
    public SterilizationLogResponse create(SterilizationLogRequest request) {
        OperatingRoom room = operatingRoomRepository.findById(request.roomId())
                .orElseThrow(() -> new RuntimeException("Sala cu id=" + request.roomId() + " nu există."));

        // Verificăm că nu există deja un proces de sterilizare activ pentru această sală
        boolean hasActiveLog = sterilizationLogRepository
                .findByRoom_IdOrderByStartTimeDesc(request.roomId())
                .stream()
                .anyMatch(log -> log.getStatus() == SterilizationStatus.IN_PROGRESS);

        if (hasActiveLog) {
            throw new RuntimeException(
                    "Sala '" + room.getName() + "' are deja un proces de sterilizare în desfășurare.");
        }

        User technician = null;
        if (request.technicianId() != null) {
            // UserRepository<User, String> — workaround pentru inconsistența existentă a tipului ID
            technician = userRepository.findById(request.technicianId().toString())
                    .orElseThrow(() -> new RuntimeException(
                            "Tehnicianul cu id=" + request.technicianId() + " nu există."));
        }

        SterilizationLog log = SterilizationLog.builder()
                .room(room)
                .startTime(request.startTime())
                .status(SterilizationStatus.IN_PROGRESS)
                .technician(technician)
                .build();

        // Actualizăm statusul sălii
        room.setStatus(RoomStatus.STERILIZING);
        operatingRoomRepository.save(room);

        return SterilizationLogResponse.from(sterilizationLogRepository.save(log));
    }

    /**
     * Marchează un log de sterilizare ca COMPLETED și redă sala în starea AVAILABLE.
     */
    @Transactional
    public SterilizationLogResponse complete(UUID logId) {
        SterilizationLog log = sterilizationLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Log-ul de sterilizare cu id=" + logId + " nu există."));

        if (log.getStatus() == SterilizationStatus.COMPLETED) {
            throw new RuntimeException("Log-ul de sterilizare este deja marcat ca COMPLETED.");
        }

        log.setStatus(SterilizationStatus.COMPLETED);
        log.setEndTime(LocalDateTime.now());

        // Marcăm sala ca disponibilă din nou
        OperatingRoom room = log.getRoom();
        room.setStatus(RoomStatus.AVAILABLE);
        operatingRoomRepository.save(room);

        return SterilizationLogResponse.from(sterilizationLogRepository.save(log));
    }
}
