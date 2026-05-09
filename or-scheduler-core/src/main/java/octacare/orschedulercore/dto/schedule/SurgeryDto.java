package octacare.orschedulercore.dto.schedule;

import java.util.UUID;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record SurgeryDto (
        UUID id,
        UUID surgeonId,
        UUID surgeryTypeId,
        String priority,
        Integer durationMinutes,
        String requiredRoomType
) {}
