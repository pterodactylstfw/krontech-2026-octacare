package octacare.orschedulercore.dto.schedule;

import java.time.LocalDate;
import java.util.List;

public record ScheduleGenerationRequest (
        LocalDate dateRangeStart,
        LocalDate dateRangeEnd,
        List<RoomDto> rooms,
        List<SurgeonAvailabilityDto> surgeonsAvailability,
        List<SurgeryDto> surgeries
){}
