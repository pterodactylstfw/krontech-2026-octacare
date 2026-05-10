package octacare.orschedulercore.service;

import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.dashboard.DashboardResponse;
import octacare.orschedulercore.entity.OperatingRoom;
import octacare.orschedulercore.entity.Surgery;
import octacare.orschedulercore.entity.User;
import octacare.orschedulercore.entity.enums.Role;
import octacare.orschedulercore.entity.enums.SurgeryStatus;
import octacare.orschedulercore.repository.OperatingRoomRepository;
import octacare.orschedulercore.repository.SurgeryRepository;
import octacare.orschedulercore.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SurgeryRepository surgeryRepository;
    private final OperatingRoomRepository roomRepository;
    private final UserRepository userRepository;

    public DashboardResponse getDashboardData() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        List<Surgery> todaySurgeries = surgeryRepository.findByScheduledStartBetween(startOfDay, endOfDay);
        List<OperatingRoom> rooms = roomRepository.findAll();
        List<User> surgeons = userRepository.findByRole(Role.SURGEON);

        // 1. KPIs
        List<DashboardResponse.KpiDto> kpis = List.of(
                new DashboardResponse.KpiDto("Surgeries Today", String.valueOf(todaySurgeries.size()), "↑ 2 vs yesterday", "up", "blue"),
                new DashboardResponse.KpiDto("OR Utilization", "64%", "↑ 8% vs last week", "up", "green"),
                new DashboardResponse.KpiDto("Staff On Duty", surgeons.size() + " Surgeons", "All active", "neutral", "amber"),
                new DashboardResponse.KpiDto("Critical Alerts", "0", "None detected", "neutral", "red")
        );

        // 2. Operating Rooms
        List<DashboardResponse.RoomStatusDto> roomStatuses = rooms.stream().map(r -> {
            Surgery currentSurgery = todaySurgeries.stream()
                    .filter(s -> s.getRoom() != null && s.getRoom().getId().equals(r.getId()))
                    .filter(s -> s.getStatus() == SurgeryStatus.IN_PROGRESS)
                    .findFirst().orElse(null);

            return new DashboardResponse.RoomStatusDto(
                    r.getId().toString(),
                    r.getName(),
                    r.getRoomType().name(),
                    "Floor " + (r.getFloor() != null ? r.getFloor() : "1"),
                    65, // Mock utilization
                    r.getStatus().name().toLowerCase(),
                    currentSurgery != null ? currentSurgery.getSurgeon().getFullName() : null,
                    currentSurgery != null ? currentSurgery.getScheduledEnd().toLocalTime().toString() : null,
                    null, null
            );
        }).collect(Collectors.toList());

        // 3. Surgeons
        List<DashboardResponse.SurgeonStatDto> surgeonStats = surgeons.stream().limit(4).map(s -> {
            long count = todaySurgeries.stream()
                    .filter(surg -> surg.getSurgeon() != null && surg.getSurgeon().getId().equals(s.getId()))
                    .count();
            
            return new DashboardResponse.SurgeonStatDto(
                    getInitials(s.getFullName()),
                    s.getFullName(),
                    s.getDepartment() != null ? s.getDepartment() : "General",
                    (int) count,
                    "blue",
                    "on-duty"
            );
        }).collect(Collectors.toList());

        // 4. Alerts (Mock)
        List<DashboardResponse.AlertDto> alerts = List.of(
                new DashboardResponse.AlertDto(1, "System fully operational", "All services running", "info")
        );

        // 5. Timeline (Mocking simplified version for today)
        List<DashboardResponse.TimelineRowDto> timeline = new ArrayList<>();
        String[] hours = {"08:00", "09:00", "10:00", "11:00", "12:00", "13:00"};
        for (String hour : hours) {
            timeline.add(new DashboardResponse.TimelineRowDto(
                    hour,
                    new DashboardResponse.TimelineBlockDto("", "", "empty", false),
                    new DashboardResponse.TimelineBlockDto("", "", "empty", false),
                    new DashboardResponse.TimelineBlockDto("", "", "empty", false),
                    new DashboardResponse.TimelineBlockDto("", "", "empty", false)
            ));
        }

        // 6. MiniStats
        List<DashboardResponse.MiniStatDto> miniStats = List.of(
                new DashboardResponse.MiniStatDto("Weekly surgeries", "47", "Target: 60", 78, "blue"),
                new DashboardResponse.MiniStatDto("Patient turnover", "92%", "On-time rate", 92, "amber")
        );

        return DashboardResponse.builder()
                .kpis(kpis)
                .operatingRooms(roomStatuses)
                .surgeons(surgeonStats)
                .alerts(alerts)
                .timeline(timeline)
                .miniStats(miniStats)
                .aiInsight("All systems are green. OR 1 has optimal scheduling today.")
                .build();
    }

    private String getInitials(String name) {
        if (name == null || name.isEmpty()) return "??";
        String[] parts = name.split(" ");
        StringBuilder initials = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) initials.append(part.charAt(0));
        }
        return initials.toString().toUpperCase();
    }
}
