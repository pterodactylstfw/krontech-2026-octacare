package octacare.orschedulercore.dto.schedule;

import java.time.LocalDate;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record SurgeonAvailabilityDto (
        @JsonProperty("surgeon_id") UUID surgeonId,
        LocalDate date,
        @JsonProperty("start_time") String startTime,
        @JsonProperty("end_time") String endTime
){}
