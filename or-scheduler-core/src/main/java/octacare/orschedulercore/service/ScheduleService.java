package octacare.orschedulercore.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import octacare.orschedulercore.dto.schedule.*;
import octacare.orschedulercore.dto.SurgeryResponse;
import octacare.orschedulercore.entity.OperatingRoom;
import octacare.orschedulercore.entity.Surgery;
import octacare.orschedulercore.entity.User;
import octacare.orschedulercore.entity.enums.Role;
import octacare.orschedulercore.entity.enums.SurgeryStatus;
import octacare.orschedulercore.repository.OperatingRoomRepository;
import octacare.orschedulercore.repository.SurgeryRepository;
import octacare.orschedulercore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final SurgeryRepository surgeryRepository;
    private final OperatingRoomRepository roomRepository;
    private final UserRepository userRepository;
    private final WebClient webClient;
    private final NotificationService notificationService;

    @Value("${algorithm.url:http://localhost:8000}")
    private String algorithmUrl;

    /**
     * Colecteaza datele din DB si apeleaza algoritmul Python pentru a genera programul.
     */
    @Transactional
    public ScheduleGenerationResponse generateSchedule(LocalDate startDate, LocalDate endDate) {
        log.info("Generating schedule from {} to {} using algorithm at {}", startDate, endDate, algorithmUrl);

        // 1. Obtinem salile disponibile
        List<OperatingRoom> rooms = roomRepository.findAll();
        log.info("Found {} operating rooms", rooms.size());
        List<RoomDto> roomDtos = rooms.stream()
                .map(r -> new RoomDto(
                        r.getId(), 
                        r.getName(), 
                        r.getRoomType() != null ? r.getRoomType().name() : "GENERAL", 
                        r.getSterilizationTimeMinutes() != null ? r.getSterilizationTimeMinutes() : 45
                ))
                .toList();

        // 2. Obtinem medicii chirurgi (Mock pentru disponibilitate deoarece lipseste entitatea momentan)
        List<User> surgeons = userRepository.findByRole(Role.SURGEON);
        log.info("Found {} surgeons", surgeons.size());
        List<SurgeonAvailabilityDto> surgeonAvailabilityDtos = new ArrayList<>();
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            for (User s : surgeons) {
                surgeonAvailabilityDtos.add(new SurgeonAvailabilityDto(
                        s.getId(),
                        currentDate,
                        "08:00",
                        "16:00"
                ));
            }
            currentDate = currentDate.plusDays(1);
        }

        // 3. Get surgeries to (re-)schedule:
        //    - SCHEDULED ones in the requested date range (re-optimization of existing day)
        //    - All PENDING ones (not yet assigned a slot), regardless of date
        LocalDateTime rangeStart = startDate.atStartOfDay();
        LocalDateTime rangeEnd   = endDate.atTime(23, 59, 59);
        Map<UUID, Surgery> toScheduleMap = new LinkedHashMap<>();
        surgeryRepository.findByScheduledStartBetween(rangeStart, rangeEnd)
                .stream()
                .filter(s -> s.getStatus() == SurgeryStatus.SCHEDULED || s.getStatus() == SurgeryStatus.PENDING)
                .forEach(s -> toScheduleMap.put(s.getId(), s));
        surgeryRepository.findByStatus(SurgeryStatus.PENDING)
                .forEach(s -> toScheduleMap.put(s.getId(), s));
        List<Surgery> pendingSurgeries = new ArrayList<>(toScheduleMap.values());
        log.info("Found {} surgeries to (re-)schedule", pendingSurgeries.size());

        List<SurgeryDto> surgeryDtos = new ArrayList<>();
        for (Surgery s : pendingSurgeries) {
            try {
                if (s.getId() == null || s.getSurgeon() == null || s.getSurgeryType() == null) {
                    log.warn("⚠️ Skipping inconsistent surgery record: id={}, surgeon={}, type={}", 
                        s.getId(), s.getSurgeon() != null ? "exists" : "NULL", s.getSurgeryType() != null ? "exists" : "NULL");
                    continue;
                }
                
                surgeryDtos.add(new SurgeryDto(
                        s.getId(),
                        s.getSurgeon().getId(),
                        s.getSurgeryType().getId(),
                        s.getPriority() != null ? s.getPriority().name() : "ELECTIVE",
                        (s.getSurgeryType().getAvgDurationMinutes() != null && s.getSurgeryType().getAvgDurationMinutes() > 0) ? s.getSurgeryType().getAvgDurationMinutes() : 60,
                        "GENERAL"
                ));
            } catch (Exception e) {
                log.error("❌ Error mapping pending surgery {}: {}", s.getId(), e.getMessage());
            }
        }

        // Construim payload-ul catre algoritm
        ScheduleGenerationRequest request = new ScheduleGenerationRequest(
                startDate,
                endDate,
                roomDtos,
                surgeonAvailabilityDtos,
                surgeryDtos
        );

        // 4. Apelam algoritmul prin WebClient
        log.info("Calling python scheduling algorithm...");
        ScheduleGenerationResponse response = null;
        try {
            response = webClient.post()
                    .uri(algorithmUrl + "/api/schedule/generate")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(ScheduleGenerationResponse.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to call scheduling algorithm at {}: {}", algorithmUrl, e.getMessage());
            throw new RuntimeException("Eroare la apelarea algoritmului de programare (" + algorithmUrl + "): " + e.getMessage(), e);
        }

        // 5. Salvam rezultatul in baza de date
        if (response != null && response.schedule() != null) {
            log.info("Algorithm returned {} scheduled surgeries. Status: {}, Score: {}", 
                response.schedule().size(), response.status(), response.score());
            
            java.util.Set<UUID> scheduledIds = response.schedule().stream()
                .map(ScheduledSurgeryDto::surgeryId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

            for (ScheduledSurgeryDto dto : response.schedule()) {
                log.debug("Processing scheduled surgery DTO: {}", dto);
                
                if (dto.surgeryId() == null) {
                    log.error("❌ CRITICAL: Received surgery with NULL id from algorithm. DTO: {}", dto);
                    continue;
                }
                
                try {
                    surgeryRepository.findById(dto.surgeryId()).ifPresentOrElse(s -> {
                        log.info("Updating surgery {} with start {} and end {}", s.getId(), dto.startTime(), dto.endTime());
                        s.setScheduledStart(dto.startTime());
                        s.setScheduledEnd(dto.endTime());
                        
                        if (dto.roomId() != null) {
                            roomRepository.findById(dto.roomId()).ifPresentOrElse(
                                room -> {
                                    log.debug("Assigning room {} ({}) to surgery {}", room.getName(), room.getId(), s.getId());
                                    s.setRoom(room);
                                },
                                () -> log.warn("⚠️ Room {} not found in database for surgery {}", dto.roomId(), s.getId())
                            );
                        } else {
                            log.warn("⚠️ No room_id provided for surgery {}", s.getId());
                        }
                        
                        s.setStatus(SurgeryStatus.SCHEDULED);
                        surgeryRepository.save(s);
                        log.info("✅ Successfully saved surgery {}", s.getId());
                    }, () -> {
                        log.warn("⚠️ Surgery {} not found in database, skipping.", dto.surgeryId());
                    });
                } catch (Exception innerEx) {
                    log.error("❌ Error processing surgery {}: {}", dto.surgeryId(), innerEx.getMessage(), innerEx);
                }
            }

            // Mark unscheduled surgeries as PENDING
            for (Surgery s : pendingSurgeries) {
                if (!scheduledIds.contains(s.getId())) {
                    log.info("Surgery {} was not scheduled by the algorithm. Marking as PENDING.", s.getId());
                    s.setStatus(SurgeryStatus.PENDING);
                    s.setScheduledStart(null);
                    s.setScheduledEnd(null);
                    s.setRoom(null);
                    surgeryRepository.save(s);
                }
            }
        } else {
            log.warn("Algorithm returned null or empty response");
        }

        // 6. Trimitere notificari real-time
        if (response != null && response.schedule() != null && !response.schedule().isEmpty()) {
            notificationService.sendGlobalNotification(
                "Program actualizat", 
                "Programul salilor de operatie a fost optimizat pentru perioada solicitata.", 
                "success"
            );

            // Notificam chirurgii implicati (folosim email-ul ca username pentru STOMP)
            response.schedule().stream()
                .map(ScheduledSurgeryDto::surgeryId)
                .map(id -> surgeryRepository.findById(id).orElse(null))
                .filter(java.util.Objects::nonNull)
                .map(Surgery::getSurgeon)
                .filter(java.util.Objects::nonNull)
                .map(User::getEmail)
                .distinct()
                .forEach(email -> {
                    notificationService.sendUserNotification(
                        email,
                        "Actualizare program",
                        "Interventiile tale au fost reprogramate in urma optimizarii.",
                        "info"
                    );
                });
        }

        return response;
    }

    /**
     * Obtine interventiile programate intr-un anumit interval.
     */
    public List<SurgeryResponse> getSchedule(LocalDateTime start, LocalDateTime end) {
        return surgeryRepository.findByScheduledStartBetween(start, end)
                .stream()
                .map(SurgeryResponse::from)
                .collect(Collectors.toList());
    }
}
