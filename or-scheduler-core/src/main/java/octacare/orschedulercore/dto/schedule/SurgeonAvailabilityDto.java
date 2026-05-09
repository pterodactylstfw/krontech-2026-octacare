package octacare.orschedulercore.dto.schedule;

import java.time.LocalDate;
import java.util.UUID;

public record SurgeonAvailabilityDto (
        UUID surgeonId,
        LocalDate date,
        String startTime,
        String endTime
){}
