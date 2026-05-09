package octacare.orschedulercore.service;

import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.SurgeonAvailabilityRequest;
import octacare.orschedulercore.dto.SurgeonAvailabilityResponse;
import octacare.orschedulercore.entity.SurgeonAvailability;
import octacare.orschedulercore.entity.User;
import octacare.orschedulercore.entity.enums.Role;
import octacare.orschedulercore.repository.SurgeonAvailabilityRepository;
import octacare.orschedulercore.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SurgeonAvailabilityService {

    private final SurgeonAvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;

    public List<SurgeonAvailabilityResponse> getAll(LocalDate from, LocalDate to, UUID surgeonId) {
        validateDateRange(from, to);
        List<SurgeonAvailability> availability;
        if (surgeonId != null && from != null && to != null) {
            availability = availabilityRepository.findBySurgeon_IdAndDateBetweenOrderByDateAscStartTimeAsc(
                    surgeonId,
                    from,
                    to);
        } else if (surgeonId != null) {
            availability = availabilityRepository.findBySurgeon_IdOrderByDateAscStartTimeAsc(surgeonId);
        } else if (from != null && to != null) {
            availability = availabilityRepository.findByDateBetweenOrderByDateAscStartTimeAsc(from, to);
        } else {
            availability = availabilityRepository.findAll();
        }

        return availability.stream().map(SurgeonAvailabilityResponse::from).toList();
    }

    public List<SurgeonAvailabilityResponse> getBySurgeon(UUID surgeonId, LocalDate from, LocalDate to) {
        validateDateRange(from, to);
        List<SurgeonAvailability> availability;
        if (from != null && to != null) {
            availability = availabilityRepository.findBySurgeon_IdAndDateBetweenOrderByDateAscStartTimeAsc(
                    surgeonId,
                    from,
                    to);
        } else {
            availability = availabilityRepository.findBySurgeon_IdOrderByDateAscStartTimeAsc(surgeonId);
        }

        return availability.stream().map(SurgeonAvailabilityResponse::from).toList();
    }

    public SurgeonAvailabilityResponse getById(UUID id) {
        return SurgeonAvailabilityResponse.from(getEntity(id));
    }

    @Transactional
    public SurgeonAvailabilityResponse create(SurgeonAvailabilityRequest request) {
        validateTimeRange(request.startTime(), request.endTime());

        User surgeon = getSurgeon(request.surgeonId());
        ensureNoOverlap(null, surgeon.getId(), request.date(), request.startTime(), request.endTime());

        SurgeonAvailability availability = SurgeonAvailability.builder()
                .surgeon(surgeon)
                .date(request.date())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .isAvailable(request.isAvailable())
                .reason(request.reason())
                .build();

        return SurgeonAvailabilityResponse.from(availabilityRepository.save(availability));
    }

    @Transactional
    public SurgeonAvailabilityResponse update(UUID id, SurgeonAvailabilityRequest request) {
        validateTimeRange(request.startTime(), request.endTime());

        SurgeonAvailability availability = getEntity(id);
        User surgeon = getSurgeon(request.surgeonId());
        ensureNoOverlap(id, surgeon.getId(), request.date(), request.startTime(), request.endTime());

        availability.setSurgeon(surgeon);
        availability.setDate(request.date());
        availability.setStartTime(request.startTime());
        availability.setEndTime(request.endTime());
        availability.setIsAvailable(request.isAvailable());
        availability.setReason(request.reason());

        return SurgeonAvailabilityResponse.from(availabilityRepository.save(availability));
    }

    @Transactional
    public void delete(UUID id) {
        if (!availabilityRepository.existsById(id)) {
            throw new RuntimeException("Availability not found with id: " + id);
        }
        availabilityRepository.deleteById(id);
    }

    private SurgeonAvailability getEntity(UUID id) {
        return availabilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Availability not found with id: " + id));
    }

    private User getSurgeon(UUID surgeonId) {
        User user = userRepository.findById(surgeonId)
                .orElseThrow(() -> new RuntimeException("Surgeon not found with id: " + surgeonId));
        if (user.getRole() != Role.SURGEON) {
            throw new RuntimeException("User is not a surgeon: " + surgeonId);
        }
        return user;
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new RuntimeException("Interval invalid: ora de inceput trebuie sa fie inainte de ora de sfarsit.");
        }
    }

    private void validateDateRange(LocalDate from, LocalDate to) {
        if ((from == null) != (to == null)) {
            throw new RuntimeException("Interval invalid: trebuie specificate ambele valori 'from' si 'to'.");
        }
        if (from != null && from.isAfter(to)) {
            throw new RuntimeException("Interval invalid: 'from' trebuie sa fie inainte de 'to'.");
        }
    }

    private void ensureNoOverlap(UUID excludeId, UUID surgeonId, LocalDate date, LocalTime startTime,
            LocalTime endTime) {
        if (availabilityRepository.existsOverlap(surgeonId, date, startTime, endTime, excludeId)) {
            throw new RuntimeException("Intervalul se suprapune cu o disponibilitate existenta.");
        }
    }
}
