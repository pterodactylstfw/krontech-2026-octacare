package octacare.orschedulercore.dto;

import octacare.orschedulercore.entity.User;
import octacare.orschedulercore.entity.enums.Role;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String fullName,
        Role role,
        String specialization,
        String phone,
        String department,
        String createdAt,
        String updatedAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getSpecialization(),
                user.getPhone(),
                user.getDepartment(),
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null,
                user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null
        );
    }
}
