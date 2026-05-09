package octacare.orschedulercore.service;

import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.SurgeryRequest;
import octacare.orschedulercore.dto.SurgeryResponse;
import octacare.orschedulercore.entity.*;
import octacare.orschedulercore.entity.enums.SurgeryPriority;
import octacare.orschedulercore.entity.enums.SurgeryStatus;
import octacare.orschedulercore.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SurgeryService {

        private final SurgeryRepository surgeryRepository;
        private final UserRepository userRepository;
        private final PatientRepository patientRepository;
        private final OperatingRoomRepository operatingRoomRepository;
        private final SurgeryTypeRepository surgeryTypeRepository;

        public List<SurgeryResponse> getAll() {
                return surgeryRepository.findAll().stream()
                                .map(SurgeryResponse::from)
                                .collect(Collectors.toList());
        }

        public SurgeryResponse getById(UUID id) {
                return surgeryRepository.findById(id)
                                .map(SurgeryResponse::from)
                                .orElseThrow(() -> new RuntimeException("Surgery not found"));
        }

        public List<SurgeryResponse> getByStatus(SurgeryStatus status) {
                return surgeryRepository.findByStatus(status).stream()
                                .map(SurgeryResponse::from)
                                .collect(Collectors.toList());
        }

        public List<SurgeryResponse> getByPriority(SurgeryPriority priority) {
                return surgeryRepository.findByPriority(priority).stream()
                                .map(SurgeryResponse::from)
                                .collect(Collectors.toList());
        }

        public List<SurgeryResponse> getBySurgeon(UUID surgeonId) {
                return surgeryRepository.findBySurgeon_Id(surgeonId.toString()).stream()
                                .map(SurgeryResponse::from)
                                .collect(Collectors.toList());
        }

        public List<SurgeryResponse> getByPatient(UUID patientId) {
                return surgeryRepository.findByPatient_Id(patientId).stream()
                                .map(SurgeryResponse::from)
                                .collect(Collectors.toList());
        }

        @Transactional
        public SurgeryResponse create(SurgeryRequest request) {
                Patient patient = patientRepository.findById(request.patientId())
                                .or(() -> patientRepository.findByUserId(request.patientId()))
                                .orElseThrow(() -> new RuntimeException("Patient not found"));
                User surgeon = userRepository.findById(request.surgeonId().toString())
                                .orElseThrow(() -> new RuntimeException("Surgeon not found"));
                OperatingRoom room = operatingRoomRepository.findById(request.roomId())
                                .orElseThrow(() -> new RuntimeException("Operating Room not found"));
                SurgeryType surgeryType = surgeryTypeRepository.findById(request.surgeryTypeId())
                                .orElseThrow(() -> new RuntimeException("Surgery Type not found"));

                Surgery surgery = Surgery.builder()
                                .patient(patient)
                                .surgeon(surgeon)
                                .room(room)
                                .surgeryType(surgeryType)
                                .scheduledStart(request.scheduledStart())
                                .scheduledEnd(request.scheduledEnd())
                                .priority(SurgeryPriority.valueOf(request.priority().toUpperCase()))
                                .status(SurgeryStatus.SCHEDULED)
                                .notes(request.notes())
                                .build();

                return SurgeryResponse.from(surgeryRepository.save(surgery));
        }

        @Transactional
        public SurgeryResponse updateStatus(UUID id, String status) {
                Surgery surgery = surgeryRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Surgery not found"));
                surgery.setStatus(SurgeryStatus.valueOf(status.replace("\"", "").trim().toUpperCase()));
                return SurgeryResponse.from(surgeryRepository.save(surgery));
        }

        @Transactional
        public SurgeryResponse reschedule(UUID id, LocalDateTime newStart, LocalDateTime newEnd) {
                Surgery surgery = surgeryRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Surgery not found"));
                surgery.setScheduledStart(newStart);
                surgery.setScheduledEnd(newEnd);
                return SurgeryResponse.from(surgeryRepository.save(surgery));
        }

        @Transactional
        public SurgeryResponse update(UUID id, SurgeryRequest request) {
                Surgery surgery = surgeryRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Surgery not found"));

                Patient patient = patientRepository.findById(request.patientId())
                                .or(() -> patientRepository.findByUserId(request.patientId()))
                                .orElseThrow(() -> new RuntimeException("Patient not found"));
                User surgeon = userRepository.findById(request.surgeonId().toString())
                                .orElseThrow(() -> new RuntimeException("Surgeon not found"));
                OperatingRoom room = operatingRoomRepository.findById(request.roomId())
                                .orElseThrow(() -> new RuntimeException("Operating Room not found"));
                SurgeryType surgeryType = surgeryTypeRepository.findById(request.surgeryTypeId())
                                .orElseThrow(() -> new RuntimeException("Surgery Type not found"));

                surgery.setPatient(patient);
                surgery.setSurgeon(surgeon);
                surgery.setRoom(room);
                surgery.setSurgeryType(surgeryType);
                surgery.setScheduledStart(request.scheduledStart());
                surgery.setScheduledEnd(request.scheduledEnd());
                surgery.setPriority(SurgeryPriority.valueOf(request.priority().toUpperCase()));
                surgery.setNotes(request.notes());

                return SurgeryResponse.from(surgeryRepository.save(surgery));
        }
}
