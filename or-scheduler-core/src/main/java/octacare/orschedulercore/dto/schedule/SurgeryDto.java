package octacare.orschedulercore.dto.schedule;

import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record SurgeryDto (
        UUID id,
        @JsonProperty("surgeon_id") UUID surgeonId,
        @JsonProperty("surgery_type_id") UUID surgeryTypeId,
        String priority,
        @JsonProperty("duration_minutes") Integer durationMinutes,
        @JsonProperty("required_room_type") String requiredRoomType
) {}
