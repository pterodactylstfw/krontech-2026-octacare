package octacare.orschedulercore.dto;

import java.time.LocalDateTime;

/**
 * Response standard pentru erori API.
 */
public record ErrorResponse(
    int status,
    String message,
    String details,
    LocalDateTime timestamp
) { }

