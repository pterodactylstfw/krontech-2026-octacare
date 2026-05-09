package octacare.orschedulercore.dto;

import octacare.orschedulercore.entity.SurgeonAvailability;
import octacare.orschedulercore.entity.enums.AvailabilityReason;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record SurgeonAvailabilityResponse(
        UUID id,
        UUID surgeonId,
        String surgeonName,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        boolean isAvailable,
        AvailabilityReason reason) {
    public static SurgeonAvailabilityResponse from(SurgeonAvailability entity) {
        return new SurgeonAvailabilityResponse(
                entity.getId(),
                entity.getSurgeon().getId(),
                entity.getSurgeon().getFullName(),
                entity.getDate(),
                entity.getStartTime(),
                entity.getEndTime(),
                entity.isAvailable(),
                entity.getReason());
    }
}
