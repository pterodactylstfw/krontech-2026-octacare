package octacare.orschedulercore.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "surgery_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurgeryType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(name = "avg_duration_minutes", nullable = false)
    private Integer avgDurationMinutes;

    @ElementCollection
    @CollectionTable(name = "surgery_type_equipment", joinColumns = @JoinColumn(name = "surgery_type_id"))
    @Column(name = "equipment_name")
    private List<String> requiredEquipment;

    @Column(name = "complexity_level")
    private Integer complexityLevel; // 1-5
}
