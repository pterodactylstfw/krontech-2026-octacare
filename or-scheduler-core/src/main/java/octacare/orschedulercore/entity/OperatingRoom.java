package octacare.orschedulercore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import octacare.orschedulercore.entity.enums.RoomStatus;
import octacare.orschedulercore.entity.enums.RoomType;

import java.util.List;

@Entity
@Table(name = "operating_rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperatingRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private java.util.UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false)
    private RoomType roomType;

    @ElementCollection
    @CollectionTable(name = "operating_room_equipment", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "equipment_name")
    private List<String> equipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status;

    private String floor;

    @Column(name = "sterilization_time_minutes", nullable = false)
    private Integer sterilizationTimeMinutes = 45; 

    private Integer capacity;
}
