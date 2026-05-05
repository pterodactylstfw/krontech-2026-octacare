package octacare.orschedulercore.repository;

import octacare.orschedulercore.entity.SurgeryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SurgeryTypeRepository extends JpaRepository<SurgeryType, UUID> {

    Optional<SurgeryType> findByNameIgnoreCase(String name);

    List<SurgeryType> findByCategoryIgnoreCase(String category);

    boolean existsByNameIgnoreCase(String name);
}
