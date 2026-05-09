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
                entity.getPatient() != null ? entity.getPatient().getId() : null,
                (entity.getPatient() != null && entity.getPatient().getUser() != null) ? entity.getPatient().getUser().getFullName() : null,
                entity.getSurgeon() != null ? entity.getSurgeon().getId() : null,
                entity.getSurgeon() != null ? entity.getSurgeon().getFullName() : null,
                entity.getRoom() != null ? entity.getRoom().getId() : null,
                entity.getRoom() != null ? entity.getRoom().getName() : null,
                entity.getSurgeryType() != null ? entity.getSurgeryType().getId() : null,
                entity.getSurgeryType() != null ? entity.getSurgeryType().getName() : null,
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
