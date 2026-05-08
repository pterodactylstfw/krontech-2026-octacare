package octacare.orschedulercore.dto.auth;

/**
 * Response cu datele utilizatorului curent autentificat.
 * Folosit la /api/auth/me și ca răspuns de success la exchange-code.
 */
public record CurrentUserResponse(
    String id,
    String email,
    String fullName,
    String role,
    String specialization,
    String phone,
    String department
) { }

