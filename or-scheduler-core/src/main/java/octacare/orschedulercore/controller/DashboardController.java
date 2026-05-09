package octacare.orschedulercore.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.dashboard.*;
import octacare.orschedulercore.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Date agregate pentru fiecare tip de utilizator")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Dashboard Admin")
    public ResponseEntity<AdminDashboardResponse> adminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('SURGEON')")
    @Operation(summary = "Dashboard Doctor")
    public ResponseEntity<DoctorDashboardResponse> doctorDashboard(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("sub");
        return ResponseEntity.ok(dashboardService.getDoctorDashboard(email));
    }

    @GetMapping("/nurse")
    @PreAuthorize("hasRole('NURSE')")
    @Operation(summary = "Dashboard Asistentă")
    public ResponseEntity<NurseDashboardResponse> nurseDashboard(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("sub");
        return ResponseEntity.ok(dashboardService.getNurseDashboard(email));
    }

    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Dashboard Pacient")
    public ResponseEntity<PatientDashboardResponse> patientDashboard(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("sub");
        return ResponseEntity.ok(dashboardService.getPatientDashboard(email));
    }
}
