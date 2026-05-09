package octacare.orschedulercore.dto;

import octacare.orschedulercore.entity.enums.Role;

public record UserPatchRequest(
        String email,
        String fullName,
        String password,
        Role role,
        String specialization,
        String phone,
        String department
) {}
