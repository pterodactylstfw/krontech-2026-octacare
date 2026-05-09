package octacare.orschedulercore.repository;

import octacare.orschedulercore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import octacare.orschedulercore.entity.enums.Role;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    
    List<User> findByRole(Role role);
}
