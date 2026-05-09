package octacare.orschedulercore.dto.dashboard;

import java.util.List;

public record NurseDashboardResponse(

        String nurseName,

        List<SurgerySummary> surgeriesToday,

        long totalSurgeriesToday,
        long surgeriesInProgress,
        long surgeriesRemaining
) {}
