package octacare.orschedulercore.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.SterilizationLogRequest;
import octacare.orschedulercore.dto.SterilizationLogResponse;
import octacare.orschedulercore.service.SterilizationLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Sterilization Logs", description = "Istoricul sterilizărilor și statusul curent al sălilor operatorii")
public class SterilizationLogsController {

    private final SterilizationLogService sterilizationLogService;

    @GetMapping("/sterilization-logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE')")
    @Operation(summary = "Listează toate logurile de sterilizare")
    public ResponseEntity<List<SterilizationLogResponse>> getAll() {
        return ResponseEntity.ok(sterilizationLogService.getAll());
    }

    @GetMapping("/rooms/{id}/sterilization-logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'SURGEON')")
    @Operation(summary = "Istoricul sterilizărilor pentru o sală")
    public ResponseEntity<List<SterilizationLogResponse>> getByRoom(@PathVariable UUID id) {
        return ResponseEntity.ok(sterilizationLogService.getByRoom(id));
    }

    @PostMapping("/sterilization-logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE')")
    @Operation(summary = "Inițiază un proces de sterilizare pentru o sală")
    public ResponseEntity<SterilizationLogResponse> create(
            @Valid @RequestBody SterilizationLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sterilizationLogService.create(request));
    }

    @PatchMapping("/sterilization-logs/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE')")
    @Operation(summary = "Finalizează un proces de sterilizare")
    public ResponseEntity<SterilizationLogResponse> complete(@PathVariable UUID id) {
        return ResponseEntity.ok(sterilizationLogService.complete(id));
    }
}
