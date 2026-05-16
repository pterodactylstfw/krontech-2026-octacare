package octacare.orschedulercore.repository;

import octacare.orschedulercore.entity.SurgeryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SurgeryTypeRepository extends JpaRepository<SurgeryType, UUID> {

    @Query("select distinct st from SurgeryType st left join fetch st.requiredEquipment")
    List<SurgeryType> findAllWithEquipment();

    Optional<SurgeryType> findByNameIgnoreCase(String name);

    List<SurgeryType> findByCategoryIgnoreCase(String category);

    boolean existsByNameIgnoreCase(String name);
}
