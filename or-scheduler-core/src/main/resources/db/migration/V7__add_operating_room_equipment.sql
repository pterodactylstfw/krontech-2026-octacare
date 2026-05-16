-- V7__add_operating_room_equipment.sql
-- Persist operating room equipment as JSON text on operating_rooms

ALTER TABLE operating_rooms
    ADD COLUMN IF NOT EXISTS equipment TEXT;
