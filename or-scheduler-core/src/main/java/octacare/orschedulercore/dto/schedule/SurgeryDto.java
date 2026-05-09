package octacare.orschedulercore.dto.schedule;

import java.util.UUID;

public record SurgeryDto (
        UUID id,
        UUID surgeonId,
        UUID surgeryTypeId,
        String priority,
        Integer durationMinutes,
        String requiredRoomType
) {}
