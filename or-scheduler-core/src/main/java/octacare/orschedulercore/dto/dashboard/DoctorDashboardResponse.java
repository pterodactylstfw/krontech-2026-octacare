package octacare.orschedulercore.dto.dashboard;

import java.util.List;

public record DoctorDashboardResponse(

        String surgeonName,
        String specialization,

        List<SurgerySummary> mySurgeriesToday,

        SurgerySummary nextSurgery,

        long totalSurgeriesToday,
        long surgeriesCompleted,
        long surgeriesRemaining
) {}
