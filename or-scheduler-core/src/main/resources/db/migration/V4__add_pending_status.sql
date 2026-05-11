-- V4__add_pending_status.sql
-- Drop the existing constraint and add it back with 'PENDING' included

ALTER TABLE surgeries DROP CONSTRAINT surgeries_status_check;

ALTER TABLE surgeries ADD CONSTRAINT surgeries_status_check 
CHECK (status IN ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'));

-- Actualizăm default-ul pentru a fi PENDING pe viitor
ALTER TABLE surgeries ALTER COLUMN status SET DEFAULT 'PENDING';

-- Fix pentru surgeon_availability reason
ALTER TABLE surgeon_availability DROP CONSTRAINT surgeon_availability_reason_check;
ALTER TABLE surgeon_availability ADD CONSTRAINT surgeon_availability_reason_check
CHECK (reason IN ('LEAVE', 'ON_CALL', 'TRAINING', 'ON_CALL_SHIFT'));
