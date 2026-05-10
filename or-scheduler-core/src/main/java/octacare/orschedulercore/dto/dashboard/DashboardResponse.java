package octacare.orschedulercore.dto.dashboard;

import lombok.Builder;
import java.util.List;

@Builder
public record DashboardResponse(
        List<KpiDto> kpis,
        List<RoomStatusDto> operatingRooms,
        List<SurgeonStatDto> surgeons,
        List<AlertDto> alerts,
        List<TimelineRowDto> timeline,
        List<MiniStatDto> miniStats,
        String aiInsight
) {
    public record KpiDto(String label, String value, String delta, String deltaType, String accent) {}
    
    public record RoomStatusDto(
            String id,
            String name,
            String specialty,
            String floor,
            Integer utilization,
            String status,
            String currentSurgeon,
            String endsAt,
            String nextSurgeon,
            String nextTime
    ) {}

    public record SurgeonStatDto(
            String initials,
            String name,
            String department,
            Integer surgeriesToday,
            String colorClass,
            String status
    ) {}

    public record AlertDto(Integer id, String message, String detail, String severity) {}

    public record TimelineRowDto(
            String hour,
            TimelineBlockDto or1,
            TimelineBlockDto or2,
            TimelineBlockDto or3,
            TimelineBlockDto or4
    ) {}

    public record TimelineBlockDto(
            String procedureName,
            String surgeon,
            String colorType,
            Boolean hasAlert
    ) {}

    public record MiniStatDto(
            String label,
            String value,
            String subtext,
            Integer progressPct,
            String colorClass
    ) {}
}
