package octacare.orschedulercore.dto;

import octacare.orschedulercore.entity.SurgeryType;

import java.util.List;

public record SurgeryTypeResponse(
        Long id,
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
