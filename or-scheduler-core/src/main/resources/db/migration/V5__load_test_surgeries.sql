-- V3__load_test_surgeries.sql
-- Adăugăm 10 operații PENDING pentru a testa algoritmul de optimizare

INSERT INTO surgeries (id, patient_id, surgeon_id, room_id, surgery_type_id, scheduled_start, scheduled_end, status, priority, notes) VALUES
-- Batch 1: Chirurgie Cardiovasculara (Dr. Victor Stoica & Dr. Elena Dumitrescu)
('dddddddd-dddd-dddd-dddd-000000000001', '77777777-7777-7777-7777-777777777771', '22222222-2222-2222-2222-222222222221', NULL, '66666666-6666-6666-6666-666666666661', NULL, NULL, 'PENDING', 'URGENT', 'Bypass necesar cat mai curand.'),
('dddddddd-dddd-dddd-dddd-000000000002', '77777777-7777-7777-7777-777777777772', '22222222-2222-2222-2222-222222222222', NULL, '66666666-6666-6666-6666-666666666661', NULL, NULL, 'PENDING', 'ELECTIVE', 'Monitorizare post-infarct.'),

-- Batch 2: Neurochirurgie (Dr. Radu Stanescu & Dr. Ioana Marin)
('dddddddd-dddd-dddd-dddd-000000000003', '77777777-7777-7777-7777-777777777773', '22222222-2222-2222-2222-222222222223', NULL, '66666666-6666-6666-6666-666666666662', NULL, NULL, 'PENDING', 'EMERGENCY', 'Hematom extradural.'),
('dddddddd-dddd-dddd-dddd-000000000004', '77777777-7777-7777-7777-777777777774', '22222222-2222-2222-2222-222222222224', NULL, '66666666-6666-6666-6666-666666666662', NULL, NULL, 'PENDING', 'ELECTIVE', 'Tumora benigna extractie.'),

-- Batch 3: Ortopedie (Dr. Cristian Vasile & Dr. Marius Nistor)
('dddddddd-dddd-dddd-dddd-000000000005', '77777777-7777-7777-7777-777777777775', '22222222-2222-2222-2222-222222222225', NULL, '66666666-6666-6666-6666-666666666663', NULL, NULL, 'PENDING', 'URGENT', 'Fractura femur complexa.'),
('dddddddd-dddd-dddd-dddd-000000000006', '77777777-7777-7777-7777-777777777776', '22222222-2222-2222-2222-222222222226', NULL, '66666666-6666-6666-6666-666666666663', NULL, NULL, 'PENDING', 'ELECTIVE', 'Revizie proteza sold.'),

-- Batch 4: Chirurgie Generala (Dr. Bogdan Enache)
('dddddddd-dddd-dddd-dddd-000000000007', '77777777-7777-7777-7777-777777777771', '22222222-2222-2222-2222-222222222228', NULL, '66666666-6666-6666-6666-666666666664', NULL, NULL, 'PENDING', 'EMERGENCY', 'Apendicita faza avansata.'),
('dddddddd-dddd-dddd-dddd-000000000008', '77777777-7777-7777-7777-777777777772', '22222222-2222-2222-2222-222222222228', NULL, '66666666-6666-6666-6666-666666666666', NULL, NULL, 'PENDING', 'ELECTIVE', 'Colecistectomie programata.'),

-- Batch 5: Chirurgie Pediatrica (Dr. Simona Dragomir)
('dddddddd-dddd-dddd-dddd-000000000009', '77777777-7777-7777-7777-777777777774', '22222222-2222-2222-2222-222222222227', NULL, '66666666-6666-6666-6666-666666666665', NULL, NULL, 'PENDING', 'URGENT', 'Hernie incarcerata copil 5 ani.'),
('dddddddd-dddd-dddd-dddd-000000000010', '77777777-7777-7777-7777-777777777774', '22222222-2222-2222-2222-222222222227', NULL, '66666666-6666-6666-6666-666666666665', NULL, NULL, 'PENDING', 'ELECTIVE', 'Consultatie si mica interventie.');
