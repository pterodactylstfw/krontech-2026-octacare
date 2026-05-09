package octacare.orschedulercore.dto.schedule;

import java.time.LocalDate;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ScheduleGenerationRequest (
        @JsonProperty("date_range_start") LocalDate dateRangeStart,
        @JsonProperty("date_range_end") LocalDate dateRangeEnd,
        List<RoomDto> rooms,
        @JsonProperty("surgeons_availability") List<SurgeonAvailabilityDto> surgeonsAvailability,
        List<SurgeryDto> surgeries
){}
