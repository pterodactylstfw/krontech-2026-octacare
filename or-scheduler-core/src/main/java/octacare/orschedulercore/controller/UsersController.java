package octacare.orschedulercore.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.UserPatchRequest;
import octacare.orschedulercore.dto.UserResponse;
import octacare.orschedulercore.dto.UserUpsertRequest;
import octacare.orschedulercore.entity.enums.Role;
import octacare.orschedulercore.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Managementul utilizatorilor și al profilului")
public class UsersController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Returnează profilul utilizatorului curent logat")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("sub");
        return ResponseEntity.ok(userService.getByEmail(email));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listează toți utilizatorii, cu filtrare după rol și departament")
    public ResponseEntity<List<UserResponse>> getAll(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(userService.getAll(role, department));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Returnează detaliile unui utilizator după ID")
    public ResponseEntity<UserResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Creează un utilizator nou (doar Admin)")
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizează complet un utilizator (doar Admin)")
    public ResponseEntity<UserResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpsertRequest request) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Șterge un utilizator (doar Admin)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizează parțial un utilizator (doar Admin)")
    public ResponseEntity<UserResponse> patch(
            @PathVariable UUID id,
            @RequestBody UserPatchRequest request) {
        return ResponseEntity.ok(userService.patch(id, request));
    }
}
