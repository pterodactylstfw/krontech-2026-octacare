package octacare.orschedulercore.dto;

import octacare.orschedulercore.entity.SurgeryType;

import java.util.List;
import java.util.UUID;

public record SurgeryTypeResponse(
        UUID id,
        String name,
        String category,
        Integer avgDurationMinutes,
        List<String> requiredEquipment,
        Integer complexityLevel
) {
    public static SurgeryTypeResponse from(SurgeryType entity) {
        return new SurgeryTypeResponse(
                entity.getId(),
                entity.getName(),
                entity.getCategory(),
                entity.getAvgDurationMinutes(),
                entity.getRequiredEquipment(),
                entity.getComplexityLevel()
        );
    }
}
