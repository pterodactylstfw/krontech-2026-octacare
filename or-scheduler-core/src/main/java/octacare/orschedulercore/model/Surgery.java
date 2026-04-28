package octacare.orschedulercore.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "surgeries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Surgery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "surgeon_id", nullable = false)
    private User surgeon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private OperatingRoom room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "surgery_type_id", nullable = false)
    private SurgeryType surgeryType;

    @Column(name = "scheduled_start")
    private LocalDateTime scheduledStart;

    @Column(name = "scheduled_end")
    private LocalDateTime scheduledEnd;

    @Column(name = "actual_start")
    private LocalDateTime actualStart;

    @Column(name = "actual_end")
    private LocalDateTime actualEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SurgeryStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SurgeryPriority priority;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
