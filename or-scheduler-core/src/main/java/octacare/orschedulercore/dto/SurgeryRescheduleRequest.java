package octacare.orschedulercore.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record SurgeryRescheduleRequest(
        @NotNull(message = "Noua dată de început este obligatorie.")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime newStart,

        @NotNull(message = "Noua dată de sfârșit este obligatorie.")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime newEnd
) {}
