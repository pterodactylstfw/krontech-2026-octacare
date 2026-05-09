package octacare.orschedulercore.dto.schedule;

import java.time.LocalDateTime;
import java.util.UUID;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ScheduledSurgeryDto (
        UUID surgeryId,
        LocalDateTime startTime,
        LocalDateTime endTime,
        UUID roomId
){}
