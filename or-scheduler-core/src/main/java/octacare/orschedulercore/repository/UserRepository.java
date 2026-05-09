package octacare.orschedulercore.repository;

import octacare.orschedulercore.entity.User;
import octacare.orschedulercore.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByDepartmentIgnoreCase(String department);

    List<User> findByRoleAndDepartmentIgnoreCase(Role role, String department);
}
