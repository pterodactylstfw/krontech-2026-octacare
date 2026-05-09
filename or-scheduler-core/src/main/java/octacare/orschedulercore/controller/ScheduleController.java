package octacare.orschedulercore.controller;

import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.SurgeryResponse;
import octacare.orschedulercore.dto.schedule.ScheduleGenerationResponse;
import octacare.orschedulercore.service.ScheduleService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    /**
     * Declanseaza algoritmul de planificare pentru un interval de date.
     * 
     * Exemplu de apel: POST /api/schedule/generate?startDate=2026-05-10&endDate=2026-05-17
     */
    @PostMapping("/generate")
    public ResponseEntity<ScheduleGenerationResponse> generateSchedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        ScheduleGenerationResponse response = scheduleService.generateSchedule(startDate, endDate);
        return ResponseEntity.ok(response);
    }

    /**
     * Returneaza programarile dintr-un interval specific, de obicei folosit pentru afisarea in calendar.
     * 
     * Exemplu de apel: GET /api/schedule?start=2026-05-10T00:00:00&end=2026-05-17T23:59:59
     */
    @GetMapping
    public ResponseEntity<List<SurgeryResponse>> getSchedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        
        List<SurgeryResponse> surgeries = scheduleService.getSchedule(start, end);
        return ResponseEntity.ok(surgeries);
    }
}
