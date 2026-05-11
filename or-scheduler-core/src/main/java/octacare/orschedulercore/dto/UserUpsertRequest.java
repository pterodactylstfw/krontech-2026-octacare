package octacare.orschedulercore.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import octacare.orschedulercore.entity.enums.Role;

public record UserUpsertRequest(

        @NotBlank(message = "Email-ul este obligatoriu")
        @Email(message = "Format email invalid")
        String email,

        @NotBlank(message = "Numele complet este obligatoriu")
        String fullName,

        // Parola e necesara la creare (POST), opt la update (PUT)
        String password,

        @NotNull(message = "Rolul este obligatoriu")
        Role role,
 
        String specialization,
        String phone,
        String department
) {}
