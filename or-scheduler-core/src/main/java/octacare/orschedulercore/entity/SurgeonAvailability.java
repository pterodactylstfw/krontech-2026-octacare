package octacare.orschedulercore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import octacare.orschedulercore.entity.enums.AvailabilityReason;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "surgeon_availability")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurgeonAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "surgeon_id", nullable = false)
    private User surgeon;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "is_available", nullable = false)
    private boolean isAvailable;

    @Enumerated(EnumType.STRING)
    private AvailabilityReason reason;
}
