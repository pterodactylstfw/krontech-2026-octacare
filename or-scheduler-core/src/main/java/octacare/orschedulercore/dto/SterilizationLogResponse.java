package octacare.orschedulercore.dto;

import octacare.orschedulercore.entity.SterilizationLog;
import octacare.orschedulercore.entity.enums.SterilizationStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO pentru un log de sterilizare.
 * Expune datele sălii și tehnicianului fără a serializa lazy proxies.
 */
public record SterilizationLogResponse(
        UUID id,
        UUID roomId,
        String roomName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        SterilizationStatus status,
        UUID technicianId,
        String technicianName
) {
    public static SterilizationLogResponse from(SterilizationLog entity) {
        return new SterilizationLogResponse(
                entity.getId(),
                entity.getRoom().getId(),
                entity.getRoom().getName(),
                entity.getStartTime(),
                entity.getEndTime(),
                entity.getStatus(),
                entity.getTechnician() != null ? entity.getTechnician().getId() : null,
                entity.getTechnician() != null ? entity.getTechnician().getFullName() : null
        );
    }
}
