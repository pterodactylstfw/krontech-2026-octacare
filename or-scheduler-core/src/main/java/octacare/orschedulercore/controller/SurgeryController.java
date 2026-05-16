package octacare.orschedulercore.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.SurgeryRequest;
import octacare.orschedulercore.dto.SurgeryRescheduleRequest;
import octacare.orschedulercore.dto.SurgeryResponse;
import octacare.orschedulercore.entity.User;
import octacare.orschedulercore.entity.enums.SurgeryPriority;
import octacare.orschedulercore.entity.enums.SurgeryStatus;
import octacare.orschedulercore.repository.UserRepository;
import octacare.orschedulercore.service.SurgeryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/surgeries")
@RequiredArgsConstructor
@Tag(name = "Surgeries", description = "Managementul operațiilor")
public class SurgeryController {

    private final SurgeryService surgeryService;
    private final UserRepository userRepository;

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

	@GetMapping("/my")
	@Operation(summary = "Obține operațiile pacientului curent")
	public ResponseEntity<List<SurgeryResponse>> getMySurgeries() {
		// Get current user from security context
		org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

		System.out.println("🔧 getMySurgeries - Auth: " + (auth != null ? "PRESENT" : "NULL"));
		System.out.println("🔧 getMySurgeries - Auth Principal Type: " + (auth != null ? auth.getPrincipal().getClass().getSimpleName() : "N/A"));

		if (auth == null || !auth.isAuthenticated()) {
			System.out.println("❌ getMySurgeries - No authentication found");
			return ResponseEntity.status(401).build();
		}

		Object principal = auth.getPrincipal();
		String email = null;

		// Extract email from JWT subject (following the same pattern as AuthService.getCurrentUser())
		if (principal instanceof org.springframework.security.oauth2.jwt.Jwt jwt) {
			email = jwt.getSubject();  // Subject is the email in our OAuth2 setup
			System.out.println("🔧 getMySurgeries - JWT Subject (email): " + email);
		} else {
			System.out.println("❌ getMySurgeries - Principal is not JWT, it's: " + principal.getClass().getName());
			return ResponseEntity.status(401).build();
		}

		if (email == null || email.isBlank()) {
			System.out.println("❌ getMySurgeries - Could not extract email from JWT");
			return ResponseEntity.status(401).build();
		}

		// Look up user by email to get the UUID
		Optional<User> userOpt = userRepository.findByEmail(email);
		if (userOpt.isEmpty()) {
			System.out.println("❌ getMySurgeries - User not found in database for email: " + email);
			return ResponseEntity.status(401).build();
		}

		UUID userUuid = userOpt.get().getId();
		System.out.println("✅ getMySurgeries - Got user UUID: " + userUuid);
		return ResponseEntity.ok(surgeryService.getByUserIdForPatient(userUuid));
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
        return ResponseEntity.ok(surgeryService.reschedule(id, request.newStart(), request.newEnd(), request.roomId()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }
}
