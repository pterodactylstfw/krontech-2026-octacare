package octacare.orschedulercore.service;

import lombok.RequiredArgsConstructor;
import octacare.orschedulercore.dto.SurgeryTypeRequest;
import octacare.orschedulercore.dto.SurgeryTypeResponse;
import octacare.orschedulercore.entity.SurgeryType;
import octacare.orschedulercore.repository.SurgeryTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SurgeryTypeService {

    private final SurgeryTypeRepository surgeryTypeRepository;

    public List<SurgeryTypeResponse> getAll() {
        return surgeryTypeRepository.findAllWithEquipment()
                .stream()
                .map(SurgeryTypeResponse::from)
                .toList();
    }

    public List<SurgeryTypeResponse> getByCategory(String category) {
        return surgeryTypeRepository.findByCategoryIgnoreCase(category)
                .stream()
                .map(SurgeryTypeResponse::from)
                .toList();
    }

    public SurgeryTypeResponse getById(UUID id) {
        SurgeryType entity = surgeryTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Surgery type not found with id: " + id));
        return SurgeryTypeResponse.from(entity);
    }

    @Transactional
    public SurgeryTypeResponse create(SurgeryTypeRequest request) {
        if (surgeryTypeRepository.existsByNameIgnoreCase(request.name())) {
            throw new RuntimeException("Un tip de operație cu numele '" + request.name() + "' există deja.");
        }

        SurgeryType entity = SurgeryType.builder()
                .name(request.name())
                .category(request.category())
                .avgDurationMinutes(request.avgDurationMinutes())
                .requiredEquipment(request.requiredEquipment())
                .complexityLevel(request.complexityLevel())
                .build();

        return SurgeryTypeResponse.from(surgeryTypeRepository.save(entity));
    }

    @Transactional
    public SurgeryTypeResponse update(UUID id, SurgeryTypeRequest request) {
        SurgeryType entity = surgeryTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Surgery type not found with id: " + id));

        // Verificăm conflictul de nume DOAR dacă s-a schimbat
        if (!entity.getName().equalsIgnoreCase(request.name())
                && surgeryTypeRepository.existsByNameIgnoreCase(request.name())) {
            throw new RuntimeException("Un tip de operație cu numele '" + request.name() + "' există deja.");
        }

        entity.setName(request.name());
        entity.setCategory(request.category());
        entity.setAvgDurationMinutes(request.avgDurationMinutes());
        entity.setRequiredEquipment(request.requiredEquipment());
        entity.setComplexityLevel(request.complexityLevel());

        return SurgeryTypeResponse.from(surgeryTypeRepository.save(entity));
    }

    @Transactional
    public void delete(UUID id) {
        if (!surgeryTypeRepository.existsById(id)) {
            throw new RuntimeException("Surgery type not found with id: " + id);
        }
        surgeryTypeRepository.deleteById(id);
    }
}
