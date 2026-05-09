package octacare.orschedulercore.dto;

import octacare.orschedulercore.entity.Surgery;
import java.time.LocalDateTime;
import java.util.UUID;

public record SurgeryResponse(
        UUID id,
        UUID patientId,
        String patientName,
        UUID surgeonId,
        String surgeonName,
        UUID roomId,
        String roomName,
        UUID surgeryTypeId,
        String surgeryTypeName,
        LocalDateTime scheduledStart,
        LocalDateTime scheduledEnd,
        LocalDateTime actualStart,
        LocalDateTime actualEnd,
        String status,
        String priority,
        String notes,
        LocalDateTime createdAt
) {
    public static SurgeryResponse from(Surgery entity) {
        return new SurgeryResponse(
                entity.getId(),
                entity.getPatient().getId(),
                entity.getPatient().getUser().getFullName(),
                entity.getSurgeon().getId(),
                entity.getSurgeon().getFullName(),
                entity.getRoom().getId(),
                entity.getRoom().getName(),
                entity.getSurgeryType().getId(),
                entity.getSurgeryType().getName(),
                entity.getScheduledStart(),
                entity.getScheduledEnd(),
                entity.getActualStart(),
                entity.getActualEnd(),
                entity.getStatus() != null ? entity.getStatus().name() : null,
                entity.getPriority() != null ? entity.getPriority().name() : null,
                entity.getNotes(),
                entity.getCreatedAt()
        );
    }
}
