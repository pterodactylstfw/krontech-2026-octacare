package octacare.orschedulercore.repository;

import octacare.orschedulercore.entity.SurgeryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SurgeryTypeRepository extends JpaRepository<SurgeryType, Long> {

    Optional<SurgeryType> findByNameIgnoreCase(String name);

    List<SurgeryType> findByCategoryIgnoreCase(String category);

    boolean existsByNameIgnoreCase(String name);
}
