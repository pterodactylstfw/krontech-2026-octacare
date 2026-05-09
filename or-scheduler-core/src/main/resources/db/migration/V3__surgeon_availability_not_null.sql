-- Enforce NOT NULL columns for surgeon_availability time fields

UPDATE surgeon_availability
SET start_time = COALESCE(start_time, TIME '08:00')
WHERE start_time IS NULL;

UPDATE surgeon_availability
SET end_time = COALESCE(end_time, TIME '16:00')
WHERE end_time IS NULL;

UPDATE surgeon_availability
SET is_available = COALESCE(is_available, true)
WHERE is_available IS NULL;

ALTER TABLE surgeon_availability
    ALTER COLUMN start_time SET NOT NULL,
    ALTER COLUMN end_time SET NOT NULL,
    ALTER COLUMN is_available SET NOT NULL;

ALTER TABLE surgeon_availability
    ALTER COLUMN is_available SET DEFAULT true;
