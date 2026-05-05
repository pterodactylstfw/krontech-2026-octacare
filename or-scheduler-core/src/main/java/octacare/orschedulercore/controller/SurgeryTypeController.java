package octacare.orschedulercore.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.SurgeryTypeRequest;
import octacare.orschedulercore.dto.SurgeryTypeResponse;
import octacare.orschedulercore.service.SurgeryTypeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/surgery-types")
@RequiredArgsConstructor
@Tag(name = "Surgery Types", description = "Managementul tipurilor de operații")
public class SurgeryTypeController {

    private final SurgeryTypeService surgeryTypeService;

    @GetMapping
    @Operation(summary = "Listează toate tipurile de operații")
    public ResponseEntity<List<SurgeryTypeResponse>> getAll() {
        return ResponseEntity.ok(surgeryTypeService.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obține un tip de operație după ID")
    public ResponseEntity<SurgeryTypeResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(surgeryTypeService.getById(id));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Filtrează tipurile de operații după categorie")
    public ResponseEntity<List<SurgeryTypeResponse>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(surgeryTypeService.getByCategory(category));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Creează un nou tip de operație (doar Admin)")
    public ResponseEntity<SurgeryTypeResponse> create(@Valid @RequestBody SurgeryTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(surgeryTypeService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Editează un tip de operație existent (doar Admin)")
    public ResponseEntity<SurgeryTypeResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody SurgeryTypeRequest request) {
        return ResponseEntity.ok(surgeryTypeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Șterge un tip de operație (doar Admin)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        surgeryTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
