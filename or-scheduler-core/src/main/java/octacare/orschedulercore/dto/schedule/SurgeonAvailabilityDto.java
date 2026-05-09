package octacare.orschedulercore.dto.schedule;

import java.time.LocalDate;
import java.util.UUID;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record SurgeonAvailabilityDto (
        UUID surgeonId,
        LocalDate date,
        String startTime,
        String endTime
){}
