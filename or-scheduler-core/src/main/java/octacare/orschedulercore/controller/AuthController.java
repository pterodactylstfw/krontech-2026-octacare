package octacare.orschedulercore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import octacare.orschedulercore.security.CustomUserPrincipal;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class AuthController {

    private final AuthenticationManager authenticationManager;

    public AuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email(),
                            request.password()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            Object principal = authentication.getPrincipal();
            if (principal instanceof CustomUserPrincipal) {
                CustomUserPrincipal p = (CustomUserPrincipal) principal;
                AuthUserDto userDto = new AuthUserDto(p.getId().toString(), p.getEmail(), p.getFullName(), p.getRole());
                return ResponseEntity.ok(new LoginSuccessResponse("Login successful", userDto));
            }

            return ResponseEntity.ok(new LoginSuccessResponse("Login successful", null));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid credentials"));
        }
    }

    record LoginRequest(String email, String password) {}
    record LoginSuccessResponse(String message, AuthUserDto user) {}
    record AuthUserDto(String id, String email, String fullName, String role) {}
    record ErrorResponse(String error) {}
}