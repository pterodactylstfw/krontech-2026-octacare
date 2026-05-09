package octacare.orschedulercore.dto.schedule;

import java.time.LocalDate;
import java.util.List;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ScheduleGenerationRequest (
        LocalDate dateRangeStart,
        LocalDate dateRangeEnd,
        List<RoomDto> rooms,
        List<SurgeonAvailabilityDto> surgeonsAvailability,
        List<SurgeryDto> surgeries
){}
