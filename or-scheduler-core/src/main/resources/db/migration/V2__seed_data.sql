-- V2__seed_data.sql
-- Seed data for OR Scheduler (Romanian Hospital Context)

-- ============================================================================
-- 1. Insert Users
-- ============================================================================
INSERT INTO users (id, email, full_name, password_hash, role, specialization, phone, department) VALUES
-- Admini (8 valori: id, email, nume, hash, rol, spec, tel, dep)
('11111111-1111-1111-1111-111111111111', 'm.popescu@spital-brasov.ro', 'Mihai Popescu', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'ADMIN', NULL, '0722111222', 'Administratie'),
('11111111-1111-1111-1111-111111111112', 'a.ionescu@spital-brasov.ro', 'Andreea Ionescu', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'ADMIN', NULL, '0733222333', 'Administratie'),
('11111111-1111-1111-1111-111111111113', 'admin.test@spital-brasov.ro','Admin Test',      '$2a$12$jfRxRfXWnVRSeRos/AI61OPsmDYodpxbIdSBKkmmfo0sVyyWJCWGa','ADMIN',    'IT',    '0733222334',    'Administratie'),
-- Chirurgi (8 valori per rând)
('22222222-2222-2222-2222-222222222221', 'v.stoica@spital-brasov.ro', 'Victor Stoica', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'SURGEON', 'Cardiologie', '0744111222', 'Chirurgie Cardiovasculara'),
('22222222-2222-2222-2222-222222222222', 'e.dumitrescu@spital-brasov.ro', 'Elena Dumitrescu', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'SURGEON', 'Cardiologie', '0744222333', 'Chirurgie Cardiovasculara'),
('22222222-2222-2222-2222-222222222223', 'r.stanescu@spital-brasov.ro', 'Radu Stanescu', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'SURGEON', 'Neurologie', '0744333444', 'Neurochirurgie'),
('22222222-2222-2222-2222-222222222224', 'i.marin@spital-brasov.ro', 'Ioana Marin', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'SURGEON', 'Neurologie', '0744444555', 'Neurochirurgie'),
('22222222-2222-2222-2222-222222222225', 'c.vasile@spital-brasov.ro', 'Cristian Vasile', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'SURGEON', 'Ortopedie', '0744555666', 'Ortopedie si Traumatologie'),
('22222222-2222-2222-2222-222222222226', 'm.nistor@spital-brasov.ro', 'Marius Nistor', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'SURGEON', 'Ortopedie', '0744666777', 'Ortopedie si Traumatologie'),
('22222222-2222-2222-2222-222222222227', 's.dragomir@spital-brasov.ro', 'Simona Dragomir', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'SURGEON', 'Pediatrie', '0744777888', 'Chirurgie Pediatrica'),
('22222222-2222-2222-2222-222222222228', 'b.enache@spital-brasov.ro', 'Bogdan Enache', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'SURGEON', 'Chirurgie Generala', '0744888999', 'Chirurgie Generala'),
('22222222-2222-2222-2222-222222222229', 'surgeon.test@spital-brasov.ro', 'Surgeon Test', '$2a$12$jfRxRfXWnVRSeRos/AI61OPsmDYodpxbIdSBKkmmfo0sVyyWJCWGa', 'SURGEON', 'Chirurgie Generala', '0744000001', 'Chirurgie Generala'),

-- Asistente (8 valori per rând)
('33333333-3333-3333-3333-333333333331', 'a.radulescu@spital-brasov.ro', 'Ana Radulescu', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'NURSE', NULL, '0755111222', 'ATI'),
('33333333-3333-3333-3333-333333333332', 'l.constantin@spital-brasov.ro', 'Laura Constantin', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'NURSE', NULL, '0755222333', 'Bloc Operator'),
('33333333-3333-3333-3333-333333333333', 'd.marinescu@spital-brasov.ro', 'Daniel Marinescu', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'NURSE', NULL, '0755333444', 'Bloc Operator'),
('33333333-3333-3333-3333-333333333334', 'nurse.test@spital-brasov.ro', 'Nurse Test', '$2a$12$jfRxRfXWnVRSeRos/AI61OPsmDYodpxbIdSBKkmmfo0sVyyWJCWGa', 'NURSE', NULL, '0755000001', 'ATI'),

-- Pacienti (8 valori per rând)
('44444444-4444-4444-4444-444444444441', 'i.barbu@gmail.com', 'Ionel Barbu', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'PATIENT', NULL, '0766111222', NULL),
('44444444-4444-4444-4444-444444444442', 'm.dinu@yahoo.com', 'Maria Dinu', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'PATIENT', NULL, '0766222333', NULL),
('44444444-4444-4444-4444-444444444443', 'c.toma@gmail.com', 'Cosmin Toma', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'PATIENT', NULL, '0766333444', NULL),
('44444444-4444-4444-4444-444444444444', 'e.lazar@hotmail.com', 'Elena Lazar', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'PATIENT', NULL, '0766444555', NULL),
('44444444-4444-4444-4444-444444444445', 'a.georgescu@gmail.com', 'Alexandru Georgescu', '$2a$12$1Avsirc/pqcJOUxgb/VR2.TU7RbKrfPW65quideFhFMV7WoB80Zv.', 'PATIENT', NULL, '0766555666', NULL),
('44444444-4444-4444-4444-444444444446', 'patient.test@spital-brasov.ro', 'Patient Test', '$2a$12$jfRxRfXWnVRSeRos/AI61OPsmDYodpxbIdSBKkmmfo0sVyyWJCWGa', 'PATIENT', NULL, '0766000001', NULL);
-- ============================================================================
-- 2. Insert Operating Rooms
-- ============================================================================
INSERT INTO operating_rooms (id, name, room_type, status, floor, sterilization_time_minutes, capacity) VALUES
('55555555-5555-5555-5555-555555555551', 'Sala 1 - Generala', 'GENERAL', 'AVAILABLE', 1, 45, 1),
('55555555-5555-5555-5555-555555555552', 'Sala 2 - Cardiologie', 'CARDIAC', 'AVAILABLE', 2, 60, 1),
('55555555-5555-5555-5555-555555555553', 'Sala 3 - Neurologie', 'NEURO', 'STERILIZING', 3, 60, 1),
('55555555-5555-5555-5555-555555555554', 'Sala 4 - Ortopedie', 'ORTHOPEDIC', 'AVAILABLE', 1, 45, 1),
('55555555-5555-5555-5555-555555555555', 'Sala 5 - Pediatrie', 'PEDIATRIC', 'MAINTENANCE', 4, 30, 1);

-- ============================================================================
-- 3. Insert Surgery Types
-- ============================================================================
INSERT INTO surgery_types (id, name, category, avg_duration_minutes, complexity_level) VALUES
('66666666-6666-6666-6666-666666666661', 'Bypass Aortocoronarian', 'Cardiologie', 240, 5),
('66666666-6666-6666-6666-666666666662', 'Craniotomie', 'Neurologie', 300, 5),
('66666666-6666-6666-6666-666666666663', 'Protezare Sold', 'Ortopedie', 120, 3),
('66666666-6666-6666-6666-666666666664', 'Apendicectomie Laparoscopica', 'Chirurgie Generala', 60, 2),
('66666666-6666-6666-6666-666666666665', 'Cura Herniei Inghinale', 'Pediatrie', 45, 1),
('66666666-6666-6666-6666-666666666666', 'Colecistectomie', 'Chirurgie Generala', 90, 2);

-- ============================================================================
-- 4. Insert Patients
-- ============================================================================
INSERT INTO patients (id, user_id, medical_record_number, date_of_birth, blood_type) VALUES
('77777777-7777-7777-7777-777777777771', '44444444-4444-4444-4444-444444444441', 'MRN-2026-0001', '1985-04-12', 'A+'),
('77777777-7777-7777-7777-777777777772', '44444444-4444-4444-4444-444444444442', 'MRN-2026-0002', '1990-08-25', 'O+'),
('77777777-7777-7777-7777-777777777773', '44444444-4444-4444-4444-444444444443', 'MRN-2026-0003', '1975-11-03', 'B-'),
('77777777-7777-7777-7777-777777777774', '44444444-4444-4444-4444-444444444444', 'MRN-2026-0004', '2010-02-18', 'AB+'),
('77777777-7777-7777-7777-777777777775', '44444444-4444-4444-4444-444444444445', 'MRN-2026-0005', '1968-07-09', 'A-');

-- ============================================================================
-- 5. Insert Surgeries
-- ============================================================================
INSERT INTO surgeries (id, patient_id, surgeon_id, room_id, surgery_type_id, scheduled_start, scheduled_end, actual_start, actual_end, status, priority, notes) VALUES
-- IN_PROGRESS
('88888888-8888-8888-8888-888888888881', '77777777-7777-7777-7777-777777777771', '22222222-2222-2222-2222-222222222221', '55555555-5555-5555-5555-555555555552', '66666666-6666-6666-6666-666666666661', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP + INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour', NULL, 'IN_PROGRESS', 'URGENT', 'Pacient instabil hemodinamic.'),
-- COMPLETED
('88888888-8888-8888-8888-888888888882', '77777777-7777-7777-7777-777777777772', '22222222-2222-2222-2222-222222222225', '55555555-5555-5555-5555-555555555554', '66666666-6666-6666-6666-666666666663', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours 50 minutes', 'COMPLETED', 'ELECTIVE', 'Fara complicatii. Transferat pe sectie.'),
-- SCHEDULED (Maine)
('88888888-8888-8888-8888-888888888883', '77777777-7777-7777-7777-777777777773', '22222222-2222-2222-2222-222222222223', '55555555-5555-5555-5555-555555555553', '66666666-6666-6666-6666-666666666662', CURRENT_TIMESTAMP + INTERVAL '1 day 08:00', CURRENT_TIMESTAMP + INTERVAL '1 day 13:00', NULL, NULL, 'SCHEDULED', 'ELECTIVE', 'Necesita monitorizare atenta a presiunii intracraniene.'),
('88888888-8888-8888-8888-888888888884', '77777777-7777-7777-7777-777777777774', '22222222-2222-2222-2222-222222222227', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666665', CURRENT_TIMESTAMP + INTERVAL '1 day 14:00', CURRENT_TIMESTAMP + INTERVAL '1 day 14:45', NULL, NULL, 'SCHEDULED', 'ELECTIVE', 'Pacient pediatric - prezenta parintilor la trezire.'),
-- SCHEDULED (Peste 2 zile)
('88888888-8888-8888-8888-888888888885', '77777777-7777-7777-7777-777777777775', '22222222-2222-2222-2222-222222222228', '55555555-5555-5555-5555-555555555551', '66666666-6666-6666-6666-666666666666', CURRENT_TIMESTAMP + INTERVAL '2 days 09:00', CURRENT_TIMESTAMP + INTERVAL '2 days 10:30', NULL, NULL, 'SCHEDULED', 'ELECTIVE', NULL),
('88888888-8888-8888-8888-888888888886', '77777777-7777-7777-7777-777777777771', '22222222-2222-2222-2222-222222222224', '55555555-5555-5555-5555-555555555553', '66666666-6666-6666-6666-666666666662', CURRENT_TIMESTAMP + INTERVAL '2 days 11:00', CURRENT_TIMESTAMP + INTERVAL '2 days 16:00', NULL, NULL, 'SCHEDULED', 'URGENT', NULL),
-- SCHEDULED (Peste 4 zile)
('88888888-8888-8888-8888-888888888887', '77777777-7777-7777-7777-777777777772', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555552', '66666666-6666-6666-6666-666666666661', CURRENT_TIMESTAMP + INTERVAL '4 days 08:00', CURRENT_TIMESTAMP + INTERVAL '4 days 12:00', NULL, NULL, 'SCHEDULED', 'ELECTIVE', NULL),
-- SCHEDULED (Peste 6 zile)
('88888888-8888-8888-8888-888888888888', '77777777-7777-7777-7777-777777777773', '22222222-2222-2222-2222-222222222226', '55555555-5555-5555-5555-555555555554', '66666666-6666-6666-6666-666666666663', CURRENT_TIMESTAMP + INTERVAL '6 days 10:00', CURRENT_TIMESTAMP + INTERVAL '6 days 12:00', NULL, NULL, 'SCHEDULED', 'ELECTIVE', NULL),
-- CANCELLED
('88888888-8888-8888-8888-888888888889', '77777777-7777-7777-7777-777777777774', '22222222-2222-2222-2222-222222222227', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666665', CURRENT_TIMESTAMP + INTERVAL '1 day 08:00', CURRENT_TIMESTAMP + INTERVAL '1 day 08:45', NULL, NULL, 'CANCELLED', 'ELECTIVE', 'Pacientul a prezentat stare febrila. Operatia reprogramata.'),
-- EMERGENCY
('88888888-8888-8888-8888-888888888810', '77777777-7777-7777-7777-777777777775', '22222222-2222-2222-2222-222222222228', '55555555-5555-5555-5555-555555555551', '66666666-6666-6666-6666-666666666664', CURRENT_TIMESTAMP + INTERVAL '1 hour', CURRENT_TIMESTAMP + INTERVAL '2 hours', NULL, NULL, 'SCHEDULED', 'EMERGENCY', 'Apendicita acuta.');

-- ============================================================================
-- 6. Insert Surgeon Availability
-- ============================================================================
INSERT INTO surgeon_availability (id, surgeon_id, date, start_time, end_time, is_available, reason) VALUES
-- Surgeon 1 (Cardiologie)
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '22222222-2222-2222-2222-222222222221', CURRENT_DATE, '08:00', '16:00', true, NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '22222222-2222-2222-2222-222222222221', CURRENT_DATE + INTERVAL '1 day', '08:00', '16:00', true, NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '22222222-2222-2222-2222-222222222221', CURRENT_DATE + INTERVAL '2 days', '08:00', '16:00', false, 'ON_CALL'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', '22222222-2222-2222-2222-222222222221', CURRENT_DATE + INTERVAL '3 days', '08:00', '16:00', true, NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5', '22222222-2222-2222-2222-222222222221', CURRENT_DATE + INTERVAL '4 days', '08:00', '16:00', true, NULL),

-- Surgeon 3 (Neurologie)
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6', '22222222-2222-2222-2222-222222222223', CURRENT_DATE, '08:00', '16:00', true, NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7', '22222222-2222-2222-2222-222222222223', CURRENT_DATE + INTERVAL '1 day', '08:00', '16:00', true, NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb8', '22222222-2222-2222-2222-222222222223', CURRENT_DATE + INTERVAL '2 days', '08:00', '16:00', false, 'LEAVE'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb9', '22222222-2222-2222-2222-222222222223', CURRENT_DATE + INTERVAL '3 days', '08:00', '16:00', false, 'LEAVE'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb10', '22222222-2222-2222-2222-222222222223', CURRENT_DATE + INTERVAL '4 days', '08:00', '16:00', true, NULL),

-- Surgeon 8 (Generala)
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11', '22222222-2222-2222-2222-222222222228', CURRENT_DATE, '08:00', '16:00', true, NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12', '22222222-2222-2222-2222-222222222228', CURRENT_DATE + INTERVAL '1 day', '08:00', '16:00', true, NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13', '22222222-2222-2222-2222-222222222228', CURRENT_DATE + INTERVAL '2 days', '08:00', '16:00', true, NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14', '22222222-2222-2222-2222-222222222228', CURRENT_DATE + INTERVAL '3 days', '08:00', '16:00', true, NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb15', '22222222-2222-2222-2222-222222222228', CURRENT_DATE + INTERVAL '4 days', '08:00', '16:00', true, NULL);

-- ============================================================================
-- 7. Insert Sterilization Logs
-- ============================================================================
INSERT INTO sterilization_logs (id, room_id, start_time, end_time, status, technician_id) VALUES
('99999999-9999-9999-9999-999999999991', '55555555-5555-5555-5555-555555555554', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour 15 minutes', 'COMPLETED', '33333333-3333-3333-3333-333333333331'),
('99999999-9999-9999-9999-999999999992', '55555555-5555-5555-5555-555555555551', CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '5 hours 15 minutes', 'COMPLETED', '33333333-3333-3333-3333-333333333332'),
('99999999-9999-9999-9999-999999999993', '55555555-5555-5555-5555-555555555553', CURRENT_TIMESTAMP - INTERVAL '30 minutes', NULL, 'IN_PROGRESS', '33333333-3333-3333-3333-333333333333');

-- ============================================================================
-- 8. Insert Notifications
-- ============================================================================
INSERT INTO notifications (id, user_id, type, message, is_read, surgery_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '22222222-2222-2222-2222-222222222221', 'REMINDER', 'Operatia de Bypass Aortocoronarian incepe in curand.', false, '88888888-8888-8888-8888-888888888881'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '22222222-2222-2222-2222-222222222228', 'EMERGENCY', 'Apendicita acuta programata de urgenta in Sala 1.', false, '88888888-8888-8888-8888-888888888810'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111', 'WARNING', 'Sala 5 (Pediatrie) este in mentenanta.', true, NULL),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '22222222-2222-2222-2222-222222222227', 'INFO', 'Operatia a fost anulata din cauza starii pacientului.', true, '88888888-8888-8888-8888-888888888889'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '33333333-3333-3333-3333-333333333333', 'REMINDER', 'Sterilizarea in Sala 3 este in curs.', false, NULL);
