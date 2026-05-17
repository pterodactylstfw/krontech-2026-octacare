package octacare.orschedulercore.service;

import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.ReportsResponse;
import octacare.orschedulercore.entity.Surgery;
import octacare.orschedulercore.entity.enums.SurgeryStatus;
import octacare.orschedulercore.repository.OperatingRoomRepository;
import octacare.orschedulercore.repository.SurgeryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportsService {

    private static final int DAILY_CAPACITY_HOURS = 8;

    private final SurgeryRepository surgeryRepository;
    private final OperatingRoomRepository operatingRoomRepository;

    public ReportsResponse getReports() {
        List<Surgery> surgeries = surgeryRepository.findAllWithDetails();
        int roomCount = Math.max((int) operatingRoomRepository.count(), 1);

        LocalDate today = LocalDate.now();
        LocalDate currentPeriodStart = today.minusDays(30);
        LocalDate previousPeriodStart = today.minusDays(60);

        List<Surgery> currentPeriod = filterByRange(surgeries, currentPeriodStart.atStartOfDay(), today.plusDays(1).atStartOfDay());
        List<Surgery> previousPeriod = filterByRange(surgeries, previousPeriodStart.atStartOfDay(), currentPeriodStart.atStartOfDay());

        double currentUtilization = calculateUtilizationPct(currentPeriod, roomCount, currentPeriodStart, today);
        double previousUtilization = calculateUtilizationPct(previousPeriod, roomCount, previousPeriodStart, currentPeriodStart.minusDays(1));

        long currentCancelled = countCancelled(currentPeriod);
        long previousCancelled = countCancelled(previousPeriod);

        double currentCancellationRate = calculateCancellationRate(currentPeriod);

        double currentOnTimeRate = calculateOnTimeRate(currentPeriod);
        double previousOnTimeRate = calculateOnTimeRate(previousPeriod);

        List<ReportsResponse.MonthlyUtilization> utilizationByMonth = buildMonthlyUtilization(surgeries, roomCount, today);
        List<ReportsResponse.DepartmentReportRow> departmentRows = buildDepartmentRows(currentPeriod);
        List<ReportsResponse.Bottleneck> bottlenecks = buildBottlenecks(currentPeriod, utilizationByMonth, departmentRows, currentOnTimeRate, currentCancellationRate);
        List<String> recommendations = buildRecommendations(currentUtilization, currentCancellationRate, currentOnTimeRate, bottlenecks);

        return new ReportsResponse(
                "Operating Room Analytics",
                LocalDateTime.now().toString(),
                "Last 30 days",
                List.of(
                        new ReportsResponse.ReportKpi(
                                "OR Utilization",
                                formatPercent(currentUtilization),
                                formatDelta(currentUtilization - previousUtilization),
                                trendFor(currentUtilization - previousUtilization)
                        ),
                        new ReportsResponse.ReportKpi(
                                "Cancellations",
                                String.valueOf(currentCancelled),
                                formatDelta(currentCancelled - previousCancelled),
                                trendFor(currentCancelled - previousCancelled)
                        ),
                        new ReportsResponse.ReportKpi(
                                "On-Time Starts",
                                formatPercent(currentOnTimeRate),
                                formatDelta(currentOnTimeRate - previousOnTimeRate),
                                trendFor(currentOnTimeRate - previousOnTimeRate)
                        )
                ),
                utilizationByMonth,
                departmentRows,
                bottlenecks,
                recommendations
        );
    }

    private List<Surgery> filterByRange(List<Surgery> surgeries, LocalDateTime start, LocalDateTime end) {
        return surgeries.stream()
                .filter(s -> s.getScheduledStart() != null)
                .filter(s -> !s.getScheduledStart().isBefore(start) && s.getScheduledStart().isBefore(end))
                .toList();
    }

    private double calculateUtilizationPct(List<Surgery> surgeries, int roomCount, LocalDate startDate, LocalDate endDate) {
        long totalScheduledMinutes = surgeries.stream()
                .mapToLong(this::plannedMinutes)
                .sum();

        long days = Duration.between(startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay()).toDays();
        days = Math.max(days, 1);
        long availableMinutes = roomCount * days * DAILY_CAPACITY_HOURS * 60L;
        if (availableMinutes <= 0) {
            return 0;
        }
        return Math.min(100d, (totalScheduledMinutes * 100d) / availableMinutes);
    }

    private double calculateCancellationRate(List<Surgery> surgeries) {
        if (surgeries.isEmpty()) {
            return 0;
        }
        long cancelled = countCancelled(surgeries);
        return (cancelled * 100d) / surgeries.size();
    }

    private long countCancelled(List<Surgery> surgeries) {
        return surgeries.stream().filter(s -> s.getStatus() == SurgeryStatus.CANCELLED).count();
    }

    private double calculateOnTimeRate(List<Surgery> surgeries) {
        List<Surgery> withActualStart = surgeries.stream()
                .filter(s -> s.getActualStart() != null)
                .filter(s -> s.getScheduledStart() != null)
                .toList();
        if (withActualStart.isEmpty()) {
            return 0;
        }

        long onTime = withActualStart.stream()
                .filter(s -> !s.getActualStart().isAfter(s.getScheduledStart().plusMinutes(10)))
                .count();
        return (onTime * 100d) / withActualStart.size();
    }

    private int plannedMinutes(Surgery surgery) {
        if (surgery.getScheduledStart() != null && surgery.getScheduledEnd() != null) {
            long minutes = Duration.between(surgery.getScheduledStart(), surgery.getScheduledEnd()).toMinutes();
            return (int) Math.max(minutes, 0);
        }
        if (surgery.getActualStart() != null && surgery.getActualEnd() != null) {
            long minutes = Duration.between(surgery.getActualStart(), surgery.getActualEnd()).toMinutes();
            return (int) Math.max(minutes, 0);
        }
        return 0;
    }

    private List<ReportsResponse.MonthlyUtilization> buildMonthlyUtilization(List<Surgery> surgeries, int roomCount, LocalDate today) {
        List<ReportsResponse.MonthlyUtilization> result = new ArrayList<>();
        for (int i = 3; i >= 0; i--) {
            YearMonth month = YearMonth.from(today.minusMonths(i));
            List<Surgery> monthSurgeries = surgeries.stream()
                    .filter(s -> s.getScheduledStart() != null)
                    .filter(s -> YearMonth.from(s.getScheduledStart()).equals(month))
                    .filter(s -> s.getStatus() != SurgeryStatus.CANCELLED)
                    .toList();

            long totalScheduledMinutes = monthSurgeries.stream().mapToLong(this::plannedMinutes).sum();
            long availableMinutes = roomCount * month.lengthOfMonth() * DAILY_CAPACITY_HOURS * 60L;
            int pct = availableMinutes <= 0 ? 0 : (int) Math.min(100, Math.round((totalScheduledMinutes * 100d) / availableMinutes));
            result.add(new ReportsResponse.MonthlyUtilization(month.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, Locale.ENGLISH), pct, 80));
        }
        return result;
    }

    private List<ReportsResponse.DepartmentReportRow> buildDepartmentRows(List<Surgery> surgeries) {
        Map<String, List<Surgery>> grouped = surgeries.stream()
                .collect(Collectors.groupingBy(s -> {
                    if (s.getSurgeon() != null && s.getSurgeon().getDepartment() != null && !s.getSurgeon().getDepartment().isBlank()) {
                        return s.getSurgeon().getDepartment();
                    }
                    return "Unassigned";
                }, LinkedHashMap::new, Collectors.toList()));

        return grouped.entrySet().stream()
                .map(entry -> {
                    List<Surgery> list = entry.getValue();
                    long completed = list.stream().filter(s -> s.getStatus() == SurgeryStatus.COMPLETED).count();
                    double avgDuration = list.stream().mapToInt(this::plannedMinutes).average().orElse(0);
                    double onTime = calculateOnTimeRate(list);
                    double cancellation = calculateCancellationRate(list);
                    return new ReportsResponse.DepartmentReportRow(
                            entry.getKey(),
                            (int) completed,
                            (int) Math.round(avgDuration),
                            (int) Math.round(onTime),
                            (int) Math.round(cancellation)
                    );
                })
                .sorted(Comparator.comparing(ReportsResponse.DepartmentReportRow::department, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private List<ReportsResponse.Bottleneck> buildBottlenecks(
            List<Surgery> currentPeriod,
            List<ReportsResponse.MonthlyUtilization> utilizationByMonth,
            List<ReportsResponse.DepartmentReportRow> departmentRows,
            double onTimeRate,
            double cancellationRate) {

        List<ReportsResponse.Bottleneck> bottlenecks = new ArrayList<>();

        ReportsResponse.MonthlyUtilization latestMonth = utilizationByMonth.isEmpty() ? null : utilizationByMonth.getLast();
        if (latestMonth != null && latestMonth.utilizationPct() >= 85) {
            bottlenecks.add(new ReportsResponse.Bottleneck(
                    "High room load",
                    "Operating room utilization is running at " + latestMonth.utilizationPct() + "% for the current month.",
                    "medium"
            ));
        }

        if (cancellationRate >= 10) {
            bottlenecks.add(new ReportsResponse.Bottleneck(
                    "Surgery cancellations",
                    "Cancellation rate is currently " + formatPercent(cancellationRate) + ".",
                    "high"
            ));
        }

        if (onTimeRate < 80 && !currentPeriod.isEmpty()) {
            bottlenecks.add(new ReportsResponse.Bottleneck(
                    "Late starts",
                    "Only " + formatPercent(onTimeRate) + " of surgeries are starting on time.",
                    "medium"
            ));
        }

        departmentRows.stream()
                .filter(row -> row.onTimeRatePct() < 75)
                .findFirst()
                .ifPresent(row -> bottlenecks.add(new ReportsResponse.Bottleneck(
                        "Department delays",
                        row.department() + " is averaging " + row.onTimeRatePct() + "% on-time starts.",
                        "low"
                )));

        if (bottlenecks.isEmpty()) {
            bottlenecks.add(new ReportsResponse.Bottleneck(
                    "Stable operations",
                    "No major bottlenecks detected in the selected period.",
                    "low"
            ));
        }

        return bottlenecks;
    }

    private List<String> buildRecommendations(double utilization, double cancellationRate, double onTimeRate, List<ReportsResponse.Bottleneck> bottlenecks) {
        List<String> recommendations = new ArrayList<>();

        if (utilization >= 85) {
            recommendations.add("Stagger elective cases earlier in the week to reduce peak room pressure.");
        } else {
            recommendations.add("Utilization is healthy; keep the current case mix but monitor peak-hour clustering.");
        }

        if (cancellationRate >= 10) {
            recommendations.add("Review pre-op readiness and confirmation calls to reduce avoidable cancellations.");
        }

        if (onTimeRate < 80) {
            recommendations.add("Add a 10-minute buffer for first-start cases and tighten anesthesia check-in timing.");
        }

        if (bottlenecks.size() > 2) {
            recommendations.add("Run a short ops review with surgeons, anesthesia, and sterile processing to address the top bottlenecks.");
        }

        return recommendations.stream().distinct().toList();
    }

    private String formatPercent(double value) {
        return Math.max(0, Math.round(value)) + "%";
    }

    private String formatDelta(double value) {
        long rounded = Math.round(value);
        if (rounded > 0) {
            return "+" + rounded + "%";
        }
        if (rounded < 0) {
            return rounded + "%";
        }
        return "0%";
    }

    private String trendFor(double delta) {
        if (delta > 0) {
            return "up";
        }
        if (delta < 0) {
            return "down";
        }
        return "neutral";
    }
}

