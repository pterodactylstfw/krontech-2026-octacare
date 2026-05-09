package octacare.orschedulercore.dto.dashboard;

import octacare.orschedulercore.entity.Surgery;
import octacare.orschedulercore.entity.enums.SurgeryPriority;
import octacare.orschedulercore.entity.enums.SurgeryStatus;

public record SurgerySummary(
        Long id,
        String patientName,
        String surgeonName,
        String surgeryTypeName,
        String roomName,
        String scheduledStart,
        String scheduledEnd,
        SurgeryStatus status,
        SurgeryPriority priority
) {
    public static SurgerySummary from(Surgery s) {
        return new SurgerySummary(
                s.getId(),
                s.getPatient() != null ? s.getPatient().getFullName() : null,
                s.getSurgeon() != null ? s.getSurgeon().getFullName() : null,
                s.getSurgeryType() != null ? s.getSurgeryType().getName() : null,
                s.getRoom() != null ? s.getRoom().getName() : null,
                s.getScheduledStart() != null ? s.getScheduledStart().toString() : null,
                s.getScheduledEnd() != null ? s.getScheduledEnd().toString() : null,
                s.getStatus(),
                s.getPriority()
        );
    }
}
