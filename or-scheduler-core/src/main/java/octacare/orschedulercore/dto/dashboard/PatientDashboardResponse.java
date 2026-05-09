package octacare.orschedulercore.dto.dashboard;

import java.util.List;

public record PatientDashboardResponse(

        String patientName,

        SurgerySummary nextSurgery,

        List<SurgerySummary> pastSurgeries
) {}
