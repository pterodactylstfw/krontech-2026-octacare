package octacare.orschedulercore.service;

import octacare.orschedulercore.dto.auth.CurrentUserResponse;
import octacare.orschedulercore.entity.User;
import octacare.orschedulercore.repository.UserRepository;
import octacare.orschedulercore.security.CustomUserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Returnează datele utilizatorului autentificat curent din SecurityContext.
     */
    public CurrentUserResponse getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new IllegalStateException("User not authenticated");
        }

        // CustomUserPrincipal este implementarea noastră de UserDetails
        if (!(auth.getPrincipal() instanceof CustomUserPrincipal)) {
            throw new IllegalStateException("Invalid principal type");
        }

        CustomUserPrincipal principal = (CustomUserPrincipal) auth.getPrincipal();
        String email = principal.getEmail();

        // Luăm datele complete din baza de date
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new IllegalStateException("User not found in database: " + email);
        }

        return mapToCurrentUserResponse(userOpt.get());
    }

    /**
     * Obține utilizatorul după email.
     */
    public CurrentUserResponse getUserByEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found: " + email);
        }
        return mapToCurrentUserResponse(userOpt.get());
    }

    /**
     * Mapează User entity la CurrentUserResponse DTO.
     */
    private CurrentUserResponse mapToCurrentUserResponse(User user) {
        return new CurrentUserResponse(
            user.getId().toString(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name(),
            user.getSpecialization(),
            user.getPhone(),
            user.getDepartment()
        );
    }
}

