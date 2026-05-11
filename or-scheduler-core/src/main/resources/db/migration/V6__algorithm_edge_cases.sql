-- V4__algorithm_edge_cases.sql
-- Adăugăm scenarii complexe pentru a testa limitele algoritmului

-- ============================================================================
-- 1. Unavailability Edge Cases (Concedii și On-Call)
-- ============================================================================
-- Dr. Victor Stoica (Cardio) - Maine este On-Call (disponibil doar după masa)
UPDATE surgeon_availability 
SET is_available = false, reason = 'ON_CALL' 
WHERE surgeon_id = '22222222-2222-2222-2222-222222222221' 
AND date = CURRENT_DATE + INTERVAL '1 day';

INSERT INTO surgeon_availability (id, surgeon_id, date, start_time, end_time, is_available, reason) VALUES
('cccccccc-cccc-cccc-cccc-000000000001', '22222222-2222-2222-2222-222222222221', CURRENT_DATE + INTERVAL '1 day', '14:00', '20:00', true, 'ON_CALL_SHIFT');

-- Dr. Elena Dumitrescu (Cardio) - Concediu medical (toata saptamana viitoare)
INSERT INTO surgeon_availability (id, surgeon_id, date, start_time, end_time, is_available, reason) 
SELECT 
    gen_random_uuid(), 
    '22222222-2222-2222-2222-222222222222', 
    CURRENT_DATE + (i || ' days')::interval, 
    '08:00', '16:00', false, 'LEAVE'
FROM generate_series(1, 5) AS i;

-- ============================================================================
-- 2. Room Constraints
-- ============================================================================
-- Sala 2 (Cardiologie) intră în mentenanță urgentă mâine
UPDATE operating_rooms SET status = 'MAINTENANCE' WHERE id = '55555555-5555-5555-5555-555555555552';

-- ============================================================================
-- 3. Complex Surgery Edge Cases
-- ============================================================================
INSERT INTO surgeries (id, patient_id, surgeon_id, room_id, surgery_type_id, status, priority, notes) VALUES
-- Edge Case: Aceeași specializare, sală indisponibilă (Cardio)
-- Algoritmul va trebui să le mute în alte zile sau să folosească o sală GENERAL dacă e permis
('eeeeeeee-eeee-eeee-eeee-000000000001', '77777777-7777-7777-7777-777777777771', '22222222-2222-2222-2222-222222222221', NULL, '66666666-6666-6666-6666-666666666661', 'PENDING', 'URGENT', 'Cardio fara sala dedicata.'),

-- Edge Case: Chirurg cu 3 operații lungi în aceeași zi (Depășește 8 ore)
-- Dr. Radu Stanescu (Neuro) - 3 x 300 min = 900 min (15 ore). 
-- Algoritmul trebuie să le împartă pe 2 zile.
('eeeeeeee-eeee-eeee-eeee-000000000002', '77777777-7777-7777-7777-777777777772', '22222222-2222-2222-2222-222222222223', NULL, '66666666-6666-6666-6666-666666666662', 'PENDING', 'ELECTIVE', 'Neuro Maraton Part 1'),
('eeeeeeee-eeee-eeee-eeee-000000000003', '77777777-7777-7777-7777-777777777773', '22222222-2222-2222-2222-222222222223', NULL, '66666666-6666-6666-6666-666666666662', 'PENDING', 'ELECTIVE', 'Neuro Maraton Part 2'),
('eeeeeeee-eeee-eeee-eeee-000000000004', '77777777-7777-7777-7777-777777777774', '22222222-2222-2222-2222-222222222223', NULL, '66666666-6666-6666-6666-666666666662', 'PENDING', 'ELECTIVE', 'Neuro Maraton Part 3'),

-- Edge Case: Urgență majoră care trebuie să "sară peste rând"
-- Chiar dacă programul e plin, EMERGENCY trebuie să apară prima.
('eeeeeeee-eeee-eeee-eeee-000000000005', '77777777-7777-7777-7777-777777777775', '22222222-2222-2222-2222-222222222228', NULL, '66666666-6666-6666-6666-666666666664', 'PENDING', 'EMERGENCY', 'Urgenta care decaleaza tot.'),

-- Edge Case: Conflict de sală (2 chirurgi diferiți vor aceeași sală mică - Pediatrie)
('eeeeeeee-eeee-eeee-eeee-000000000006', '77777777-7777-7777-7777-777777777776', '22222222-2222-2222-2222-222222222227', NULL, '66666666-6666-6666-6666-666666666665', 'PENDING', 'URGENT', 'Conflict Pediatrie 1'),
('eeeeeeee-eeee-eeee-eeee-000000000007', '77777777-7777-7777-7777-777777777771', '22222222-2222-2222-2222-222222222229', NULL, '66666666-6666-6666-6666-666666666665', 'PENDING', 'URGENT', 'Conflict Pediatrie 2');
