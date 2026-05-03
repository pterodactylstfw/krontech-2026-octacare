package octacare.orschedulercore.dto;

import java.util.Set;

public record UserResponse(
    String id,
    String email,
    String fullName,
    Set<String> roles,
    String specialization,
    String phone,
    String department,
    String createdAt
) { }
