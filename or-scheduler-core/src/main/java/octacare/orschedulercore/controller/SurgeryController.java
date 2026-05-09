package octacare.orschedulercore.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.SurgeryRequest;
import octacare.orschedulercore.dto.SurgeryRescheduleRequest;
import octacare.orschedulercore.dto.SurgeryResponse;
import octacare.orschedulercore.entity.enums.SurgeryPriority;
import octacare.orschedulercore.entity.enums.SurgeryStatus;
import octacare.orschedulercore.service.SurgeryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/surgeries")
@RequiredArgsConstructor
@Tag(name = "Surgeries", description = "Managementul operațiilor")
public class SurgeryController {

    private final SurgeryService surgeryService;

    @GetMapping
    @Operation(summary = "Listează toate operațiile sau filtrează după status/prioritate")
    public ResponseEntity<List<SurgeryResponse>> getAll(
            @RequestParam(required = false) SurgeryStatus status,
            @RequestParam(required = false) SurgeryPriority priority) {
        if (status != null) {
            return ResponseEntity.ok(surgeryService.getByStatus(status));
        }
        if (priority != null) {
            return ResponseEntity.ok(surgeryService.getByPriority(priority));
        }
        return ResponseEntity.ok(surgeryService.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obține o operație după ID")
    public ResponseEntity<SurgeryResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(surgeryService.getById(id));
    }

    @GetMapping("/surgeon/{surgeonId}")
    @Operation(summary = "Obține operațiile unui chirurg")
    public ResponseEntity<List<SurgeryResponse>> getBySurgeon(@PathVariable UUID surgeonId) {
        return ResponseEntity.ok(surgeryService.getBySurgeon(surgeonId));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Obține operațiile unui pacient")
    public ResponseEntity<List<SurgeryResponse>> getByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(surgeryService.getByPatient(patientId));
    }

    @PostMapping
    @Operation(summary = "Programează o nouă operație")
    public ResponseEntity<SurgeryResponse> create(@Valid @RequestBody SurgeryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(surgeryService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizează o operație existentă")
    public ResponseEntity<SurgeryResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody SurgeryRequest request) {
        return ResponseEntity.ok(surgeryService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Actualizează statusul unei operații")
    public ResponseEntity<SurgeryResponse> updateStatus(
            @PathVariable UUID id,
            @RequestBody String status) {
        return ResponseEntity.ok(surgeryService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/reschedule")
    @Operation(summary = "Reprogramează o operație")
    public ResponseEntity<SurgeryResponse> reschedule(
            @PathVariable UUID id,
            @Valid @RequestBody SurgeryRescheduleRequest request) {
        return ResponseEntity.ok(surgeryService.reschedule(id, request.newStart(), request.newEnd()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }
}
