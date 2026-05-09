package octacare.orschedulercore.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.SurgeonAvailabilityRequest;
import octacare.orschedulercore.dto.SurgeonAvailabilityResponse;
import octacare.orschedulercore.service.SurgeonAvailabilityService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.springframework.format.annotation.DateTimeFormat.ISO;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Surgeon Availability", description = "Disponibilitate chirurgi")
public class SurgeonAvailabilityController {

    private final SurgeonAvailabilityService availabilityService;

    @GetMapping("/availability")
    @Operation(summary = "Listeaza disponibilitatea chirurgilor")
    public ResponseEntity<List<SurgeonAvailabilityResponse>> getAll(
            @RequestParam(required = false) UUID surgeonId,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(availabilityService.getAll(from, to, surgeonId));
    }

    @GetMapping("/availability/{id}")
    @Operation(summary = "Obtine disponibilitatea dupa ID")
    public ResponseEntity<SurgeonAvailabilityResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(availabilityService.getById(id));
    }

    @GetMapping("/surgeons/{id}/availability")
    @Operation(summary = "Listeaza disponibilitatea unui chirurg")
    public ResponseEntity<List<SurgeonAvailabilityResponse>> getBySurgeon(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(availabilityService.getBySurgeon(id, from, to));
    }

    @PostMapping("/availability")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Creeaza disponibilitate pentru chirurg (doar Admin)")
    public ResponseEntity<SurgeonAvailabilityResponse> create(
            @Valid @RequestBody SurgeonAvailabilityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(availabilityService.create(request));
    }

    @PutMapping("/availability/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Editeaza disponibilitatea (doar Admin)")
    public ResponseEntity<SurgeonAvailabilityResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody SurgeonAvailabilityRequest request) {
        return ResponseEntity.ok(availabilityService.update(id, request));
    }

    @DeleteMapping("/availability/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Sterge disponibilitatea (doar Admin)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        availabilityService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
