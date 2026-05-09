package octacare.orschedulercore.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Request DTO pentru crearea unui log de sterilizare.
 * roomId și startTime sunt obligatorii; technicianId este opțional.
 */
public record SterilizationLogRequest(

        @NotNull(message = "roomId este obligatoriu")
        UUID roomId,

        @NotNull(message = "startTime este obligatoriu")
        LocalDateTime startTime,

        UUID technicianId
) {}
