package octacare.orschedulercore.dto.schedule;

import java.util.UUID;

public record RoomDto (
        UUID id,
        String name,
        String roomType,
        Integer sterilizationTimeMinutes
) {}
