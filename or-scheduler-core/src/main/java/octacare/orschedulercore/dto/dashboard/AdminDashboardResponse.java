package octacare.orschedulercore.dto.dashboard;

import java.util.List;

public record AdminDashboardResponse(

        // KPI-uri operații azi
        long totalSurgeriesToday,
        long surgeriesScheduled,
        long surgeriesInProgress,
        long surgeriesCompleted,
        long surgeriesCancelled,

        // KPI-uri personal
        long totalSurgeons,
        long totalNurses,
        long totalPatients,

        // Lista operațiilor de azi
        List<SurgerySummary> surgeriesToday
) {}
