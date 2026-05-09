package octacare.orschedulercore.dto.schedule;

import java.time.LocalDateTime;
import java.util.UUID;

public record ScheduledSurgeryDto (
        UUID surgeryId,
        LocalDateTime startTime,
        LocalDateTime endTime,
        UUID roomId
){}
