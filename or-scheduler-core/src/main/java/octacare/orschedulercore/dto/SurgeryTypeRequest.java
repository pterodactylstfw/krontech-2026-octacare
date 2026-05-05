package octacare.orschedulercore.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SurgeryTypeRequest(

        @NotBlank(message = "Numele tipului de operație este obligatoriu.")
        String name,

        @NotBlank(message = "Categoria este obligatorie.")
        String category,

        @NotNull(message = "Durata medie este obligatorie.")
        @Min(value = 1, message = "Durata medie trebuie să fie cel puțin 1 minut.")
        Integer avgDurationMinutes,

        List<String> requiredEquipment,

        @Min(value = 1, message = "Nivelul de complexitate trebuie să fie între 1 și 5.")
        Integer complexityLevel
) {}
