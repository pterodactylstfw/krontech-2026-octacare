package octacare.orschedulercore.dto.schedule;

import java.util.UUID;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record RoomDto (
        UUID id,
        String name,
        String roomType,
        Integer sterilizationTimeMinutes
) {}
