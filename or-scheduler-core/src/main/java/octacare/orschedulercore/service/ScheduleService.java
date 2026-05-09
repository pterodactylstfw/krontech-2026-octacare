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
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final SurgeryRepository surgeryRepository;
    private final OperatingRoomRepository roomRepository;
    private final UserRepository userRepository;
    private final WebClient webClient;

    @Value("${algorithm.url:http://localhost:8000}")
    private String algorithmUrl;

    /**
     * Colecteaza datele din DB si apeleaza algoritmul Python pentru a genera programul.
     */
    @Transactional
    public ScheduleGenerationResponse generateSchedule(LocalDate startDate, LocalDate endDate) {
        log.info("Generating schedule from {} to {}", startDate, endDate);

        // 1. Obtinem salile disponibile
        List<OperatingRoom> rooms = roomRepository.findAll();
        List<RoomDto> roomDtos = rooms.stream()
                .map(r -> new RoomDto(
                        r.getId(), 
                        r.getName(), 
                        r.getRoomType().name(), 
                        r.getSterilizationTimeMinutes()
                ))
                .toList();

        // 2. Obtinem medicii chirurgi (Mock pentru disponibilitate deoarece lipseste entitatea momentan)
        List<User> surgeons = userRepository.findByRole(Role.SURGEON);
        List<SurgeonAvailabilityDto> surgeonAvailabilityDtos = surgeons.stream()
                .map(s -> new SurgeonAvailabilityDto(
                        s.getId(),
                        startDate,
                        "08:00",
                        "16:00"
                )).toList();

        // 3. Obtinem interventiile neprogramate (PENDING)
        List<Surgery> pendingSurgeries = surgeryRepository.findByStatus(SurgeryStatus.PENDING);
        List<SurgeryDto> surgeryDtos = pendingSurgeries.stream()
                .map(s -> new SurgeryDto(
                        s.getId(),
                        s.getSurgeon().getId(),
                        s.getSurgeryType().getId(),
                        s.getPriority() != null ? s.getPriority().name() : "ROUTINE",
                        s.getSurgeryType().getAvgDurationMinutes(),
                        null // Aici s-ar putea trimite tipul salii necesar
                )).toList();

        // Construim payload-ul catre algoritm
        ScheduleGenerationRequest request = new ScheduleGenerationRequest(
                startDate,
                endDate,
                roomDtos,
                surgeonAvailabilityDtos,
                surgeryDtos
        );

        // 4. Apelam algoritmul prin WebClient
        log.info("Calling python scheduling algorithm at {}/api/schedule/generate", algorithmUrl);
        ScheduleGenerationResponse response = null;
        try {
            response = webClient.post()
                    .uri(algorithmUrl + "/api/schedule/generate")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(ScheduleGenerationResponse.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to call scheduling algorithm: {}", e.getMessage());
            throw new RuntimeException("Eroare la apelarea algoritmului de programare: " + e.getMessage());
        }

        // 5. Salvam rezultatul in baza de date
        if (response != null && response.schedule() != null) {
            log.info("Algorithm returned {} scheduled surgeries", response.schedule().size());
            
            for (ScheduledSurgeryDto dto : response.schedule()) {
                surgeryRepository.findById(dto.surgeryId()).ifPresent(s -> {
                    s.setScheduledStart(dto.startTime());
                    s.setScheduledEnd(dto.endTime());
                    
                    OperatingRoom room = roomRepository.findById(dto.roomId()).orElse(null);
                    if (room != null) {
                        s.setRoom(room);
                    }
                    
                    s.setStatus(SurgeryStatus.SCHEDULED);
                    surgeryRepository.save(s);
                    log.info("Scheduled surgery {} in room {} at {}", s.getId(), dto.roomId(), dto.startTime());
                });
            }
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
