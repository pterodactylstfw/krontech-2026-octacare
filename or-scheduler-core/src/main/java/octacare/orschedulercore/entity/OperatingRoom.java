package octacare.orschedulercore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import octacare.orschedulercore.entity.enums.RoomStatus;
import octacare.orschedulercore.entity.enums.RoomType;
import octacare.orschedulercore.entity.converter.StringListConverter;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "operating_rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperatingRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false)
    private RoomType roomType;

    @Convert(converter = StringListConverter.class)
    @Column(name = "equipment", columnDefinition = "TEXT")
    private List<String> equipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status;

    private Integer floor;

    @Column(name = "sterilization_time_minutes", nullable = false)
    private Integer sterilizationTimeMinutes = 45; 

    private Integer capacity;
}
