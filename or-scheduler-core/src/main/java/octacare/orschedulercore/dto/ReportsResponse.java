package octacare.orschedulercore.dto;

import java.util.List;

public record ReportsResponse(
        String title,
        String generatedAt,
        String period,
        List<ReportKpi> kpis,
        List<MonthlyUtilization> utilizationByMonth,
        List<DepartmentReportRow> departmentRows,
        List<Bottleneck> bottlenecks,
        List<String> recommendations
) {
    public record ReportKpi(
            String label,
            String value,
            String delta,
            String trend
    ) {}

    public record MonthlyUtilization(
            String month,
            int utilizationPct,
            int targetPct
    ) {}

    public record DepartmentReportRow(
            String department,
            int completed,
            int avgDurationMinutes,
            int onTimeRatePct,
            int cancellationRatePct
    ) {}

    public record Bottleneck(
            String title,
            String detail,
            String severity
    ) {}
}

