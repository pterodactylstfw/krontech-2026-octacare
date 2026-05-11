package octacare.orschedulercore.dto.schedule;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ScheduleGenerationResponse (
        List<ScheduledSurgeryDto> schedule,
        Double score,
        List<String> conflicts,
        @JsonProperty("generation_time_ms") Long generationTimeMs,
        String status
) {}
