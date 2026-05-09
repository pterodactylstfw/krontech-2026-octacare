package octacare.orschedulercore.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import octacare.orschedulercore.entity.enums.AvailabilityReason;

public record SurgeonAvailabilityRequest(
        @NotNull(message = "Surgeon ID este obligatoriu.") UUID surgeonId,

        @NotNull(message = "Data este obligatorie.") LocalDate date,

        @NotNull(message = "Ora de inceput este obligatorie.") LocalTime startTime,

        @NotNull(message = "Ora de sfarsit este obligatorie.") LocalTime endTime,

        @NotNull(message = "Campul de disponibilitate este obligatoriu.") Boolean isAvailable,

        AvailabilityReason reason) {
}
