package octacare.orschedulercore.service;

import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.UserPatchRequest;
import octacare.orschedulercore.dto.UserResponse;
import octacare.orschedulercore.dto.UserUpsertRequest;
import octacare.orschedulercore.entity.User;
import octacare.orschedulercore.entity.enums.Role;
import octacare.orschedulercore.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAll(Role role, String department) {
        List<User> users;

        if (role != null && department != null) {
            users = userRepository.findByRoleAndDepartmentIgnoreCase(role, department);
        } else if (role != null) {
            users = userRepository.findByRole(role);
        } else if (department != null) {
            users = userRepository.findByDepartmentIgnoreCase(department);
        } else {
            users = userRepository.findAll();
        }

        return users.stream().map(UserResponse::from).toList();
    }

    public UserResponse getById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nu a fost găsit utilizatorul cu id: " + id));
        return UserResponse.from(user);
    }

    public UserResponse getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Nu a fost găsit utilizatorul cu email: " + email));
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse create(UserUpsertRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Un utilizator cu email-ul '" + request.email() + "' există deja.");
        }
        if (request.password() == null || request.password().isBlank()) {
            throw new RuntimeException("Parola este obligatorie la crearea unui utilizator.");
        }

        User user = User.builder()
                .email(request.email())
                .fullName(request.fullName())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .specialization(request.specialization())
                .phone(request.phone())
                .department(request.department())
                .build();

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(UUID id, UserUpsertRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nu a fost găsit utilizatorul cu id: " + id));

        if (!user.getEmail().equalsIgnoreCase(request.email())
                && userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Un utilizator cu email-ul '" + request.email() + "' există deja.");
        }

        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setRole(request.role());
        user.setSpecialization(request.specialization());
        user.setPhone(request.phone());
        user.setDepartment(request.department());

        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void delete(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Nu a fost găsit utilizatorul cu id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public UserResponse patch(UUID id, UserPatchRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nu a fost găsit utilizatorul cu id: " + id));

        if (request.email() != null && !request.email().isBlank()) {
            if (!user.getEmail().equalsIgnoreCase(request.email())
                    && userRepository.existsByEmail(request.email())) {
                throw new RuntimeException("Un utilizator cu email-ul '" + request.email() + "' există deja.");
            }
            user.setEmail(request.email());
        }
        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName());
        }
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.specialization() != null) {
            user.setSpecialization(request.specialization());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        if (request.department() != null) {
            user.setDepartment(request.department());
        }

        return UserResponse.from(userRepository.save(user));
    }
}
