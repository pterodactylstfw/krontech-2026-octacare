package octacare.orschedulercore.service;

import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.dashboard.*;
import octacare.orschedulercore.entity.Surgery;
import octacare.orschedulercore.entity.User;
import octacare.orschedulercore.entity.enums.Role;
import octacare.orschedulercore.entity.enums.SurgeryStatus;
import octacare.orschedulercore.repository.SurgeryRepository;
import octacare.orschedulercore.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SurgeryRepository surgeryRepository;
    private final UserRepository userRepository;

    // ─────────────────────────────────────────────
    //  ADMIN
    // ─────────────────────────────────────────────

    public AdminDashboardResponse getAdminDashboard() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay   = startOfDay.plusDays(1);

        List<Surgery> surgeriesToday = surgeryRepository.findByScheduledStartBetween(startOfDay, endOfDay);

        long scheduled   = surgeriesToday.stream().filter(s -> s.getStatus() == SurgeryStatus.SCHEDULED).count();
        long inProgress  = surgeriesToday.stream().filter(s -> s.getStatus() == SurgeryStatus.IN_PROGRESS).count();
        long completed   = surgeriesToday.stream().filter(s -> s.getStatus() == SurgeryStatus.COMPLETED).count();
        long cancelled   = surgeriesToday.stream().filter(s -> s.getStatus() == SurgeryStatus.CANCELLED).count();

        long totalSurgeons  = userRepository.findByRole(Role.SURGEON).size();
        long totalNurses    = userRepository.findByRole(Role.NURSE).size();
        long totalPatients  = userRepository.findByRole(Role.PATIENT).size();

        return new AdminDashboardResponse(
                surgeriesToday.size(),
                scheduled,
                inProgress,
                completed,
                cancelled,
                totalSurgeons,
                totalNurses,
                totalPatients,
                surgeriesToday.stream().map(SurgerySummary::from).toList()
        );
    }

    // ─────────────────────────────────────────────
    //  SURGEON
    // ─────────────────────────────────────────────

    public DoctorDashboardResponse getDoctorDashboard(String email) {
        User surgeon = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit: " + email));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay   = startOfDay.plusDays(1);
        LocalDateTime now        = LocalDateTime.now();

        List<Surgery> mySurgeriesToday = surgeryRepository
                .findBySurgeonIdAndScheduledStartBetween(surgeon.getId(), startOfDay, endOfDay);

        SurgerySummary nextSurgery = mySurgeriesToday.stream()
                .filter(s -> s.getStatus() == SurgeryStatus.SCHEDULED || s.getStatus() == SurgeryStatus.IN_PROGRESS)
                .filter(s -> s.getScheduledStart() != null && s.getScheduledStart().isAfter(now.minusHours(1)))
                .findFirst()
                .map(SurgerySummary::from)
                .orElse(null);

        long completed  = mySurgeriesToday.stream().filter(s -> s.getStatus() == SurgeryStatus.COMPLETED).count();
        long remaining  = mySurgeriesToday.stream()
                .filter(s -> s.getStatus() == SurgeryStatus.SCHEDULED || s.getStatus() == SurgeryStatus.IN_PROGRESS)
                .count();

        return new DoctorDashboardResponse(
                surgeon.getFullName(),
                surgeon.getSpecialization(),
                mySurgeriesToday.stream().map(SurgerySummary::from).toList(),
                nextSurgery,
                mySurgeriesToday.size(),
                completed,
                remaining
        );
    }

    // ─────────────────────────────────────────────
    //  NURSE
    // ─────────────────────────────────────────────

    public NurseDashboardResponse getNurseDashboard(String email) {
        User nurse = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit: " + email));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay   = startOfDay.plusDays(1);

        List<Surgery> surgeriesToday = surgeryRepository.findByScheduledStartBetween(startOfDay, endOfDay);

        long inProgress = surgeriesToday.stream().filter(s -> s.getStatus() == SurgeryStatus.IN_PROGRESS).count();
        long remaining  = surgeriesToday.stream()
                .filter(s -> s.getStatus() == SurgeryStatus.SCHEDULED || s.getStatus() == SurgeryStatus.IN_PROGRESS)
                .count();

        return new NurseDashboardResponse(
                nurse.getFullName(),
                surgeriesToday.stream().map(SurgerySummary::from).toList(),
                surgeriesToday.size(),
                inProgress,
                remaining
        );
    }

    // ─────────────────────────────────────────────
    //  PATIENT
    // ─────────────────────────────────────────────

    public PatientDashboardResponse getPatientDashboard(String email) {
        User patient = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit: " + email));

        LocalDateTime now = LocalDateTime.now();

        SurgerySummary nextSurgery = surgeryRepository
                .findByPatientIdAndScheduledStartAfterOrderByScheduledStartAsc(patient.getId(), now)
                .stream()
                .findFirst()
                .map(SurgerySummary::from)
                .orElse(null);

        List<SurgerySummary> pastSurgeries = surgeryRepository.findByPatientId(patient.getId())
                .stream()
                .filter(s -> s.getScheduledStart() != null && s.getScheduledStart().isBefore(now))
                .map(SurgerySummary::from)
                .toList();

        return new PatientDashboardResponse(
                patient.getFullName(),
                nextSurgery,
                pastSurgeries
        );
    }
}
