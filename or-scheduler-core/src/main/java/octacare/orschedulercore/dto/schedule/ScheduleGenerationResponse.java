package octacare.orschedulercore.dto.schedule;

import java.util.List;

public record ScheduleGenerationResponse (
        List<ScheduledSurgeryDto> schedule,
        Integer score,
        List<String> conflicts,
        Integer generationTimeMs,
        String status
) {}
