-- V8__add_surgery_type_equipment.sql
-- Creăm tabela lipsă pentru echipamentele necesare fiecărui tip de operație

CREATE TABLE IF NOT EXISTS surgery_type_equipment (
    surgery_type_id UUID NOT NULL REFERENCES surgery_types(id) ON DELETE CASCADE,
    equipment_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (surgery_type_id, equipment_name)
);

-- Adăugăm câteva echipamente de test pentru datele existente
INSERT INTO surgery_type_equipment (surgery_type_id, equipment_name) VALUES
('66666666-6666-6666-6666-666666666661', 'Cardiopulmonary Bypass Machine'),
('66666666-6666-6666-6666-666666666661', 'Defibrillator'),
('66666666-6666-6666-6666-666666666662', 'Operating Microscope'),
('66666666-6666-6666-6666-666666666662', 'Neuronavigation System'),
('66666666-6666-6666-6666-666666666663', 'Orthopedic Drill'),
('66666666-6666-6666-6666-666666666663', 'C-Arm X-Ray'),
('66666666-6666-6666-6666-666666666664', 'Laparoscopic Tower'),
('66666666-6666-6666-6666-666666666664', 'Insufflator')
ON CONFLICT DO NOTHING;
