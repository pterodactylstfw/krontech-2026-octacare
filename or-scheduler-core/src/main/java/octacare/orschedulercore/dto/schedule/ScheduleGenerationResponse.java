package octacare.orschedulercore.dto.schedule;

import java.util.List;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ScheduleGenerationResponse (
        List<ScheduledSurgeryDto> schedule,
        Integer score,
        List<String> conflicts,
        Integer generationTimeMs,
        String status
) {}
