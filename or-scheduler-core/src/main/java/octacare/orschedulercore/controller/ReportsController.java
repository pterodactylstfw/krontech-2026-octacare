package octacare.orschedulercore.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.ReportsResponse;
import octacare.orschedulercore.service.ReportsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Reports", description = "Operational analytics and performance reports")
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Returnează rezumatul operațional pentru dashboard-ul de rapoarte")
    public ResponseEntity<ReportsResponse> getReports() {
        return ResponseEntity.ok(reportsService.getReports());
    }
}

