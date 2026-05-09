package octacare.orschedulercore.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

public record SurgeryRequest(
        @NotNull(message = "ID-ul pacientului este obligatoriu.")
        UUID patientId,

        @NotNull(message = "ID-ul chirurgului este obligatoriu.")
        UUID surgeonId,

        @NotNull(message = "ID-ul sălii este obligatoriu.")
        UUID roomId,

        @NotNull(message = "ID-ul tipului de operație este obligatoriu.")
        UUID surgeryTypeId,

        @NotNull(message = "Data de început programată este obligatorie.")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime scheduledStart,

        @NotNull(message = "Data de sfârșit programată este obligatorie.")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime scheduledEnd,

        @NotNull(message = "Prioritatea este obligatorie.")
        String priority,

        String notes
) {}
