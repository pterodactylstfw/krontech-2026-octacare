-- V1__init_schema.sql
-- Initial database schema for OR Scheduler
-- PostgreSQL 18

-- ============================================================================
-- Table: users
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'SURGEON', 'NURSE', 'PATIENT')),
    specialization VARCHAR(255),
    phone VARCHAR(20),
    department VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- Table: operating_rooms
-- ============================================================================
CREATE TABLE operating_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('GENERAL', 'CARDIAC', 'NEURO', 'ORTHOPEDIC', 'PEDIATRIC')),
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'STERILIZING')),
    floor INT,
    sterilization_time_minutes INT DEFAULT 45,
    capacity INT
);

CREATE INDEX idx_operating_rooms_status ON operating_rooms(status);
CREATE INDEX idx_operating_rooms_room_type ON operating_rooms(room_type);

-- ============================================================================
-- Table: surgery_types
-- ============================================================================
CREATE TABLE surgery_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    avg_duration_minutes INT,
    complexity_level INT CHECK (complexity_level BETWEEN 1 AND 5)
);

CREATE INDEX idx_surgery_types_name ON surgery_types(name);
CREATE INDEX idx_surgery_types_category ON surgery_types(category);

-- ============================================================================
-- Table: patients
-- ============================================================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medical_record_number VARCHAR(255) UNIQUE,
    date_of_birth DATE,
    blood_type VARCHAR(10)
);

CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_medical_record_number ON patients(medical_record_number);

-- ============================================================================
-- Table: surgeries
-- ============================================================================
CREATE TABLE surgeries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    surgeon_id UUID REFERENCES users(id) ON DELETE SET NULL,
    room_id UUID REFERENCES operating_rooms(id) ON DELETE SET NULL,
    surgery_type_id UUID REFERENCES surgery_types(id) ON DELETE SET NULL,
    scheduled_start TIMESTAMP,
    scheduled_end TIMESTAMP,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED')),
    priority VARCHAR(50) NOT NULL DEFAULT 'ELECTIVE' CHECK (priority IN ('ELECTIVE', 'URGENT', 'EMERGENCY')),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_surgeries_patient_id ON surgeries(patient_id);
CREATE INDEX idx_surgeries_surgeon_id ON surgeries(surgeon_id);
CREATE INDEX idx_surgeries_room_id ON surgeries(room_id);
CREATE INDEX idx_surgeries_status ON surgeries(status);
CREATE INDEX idx_surgeries_priority ON surgeries(priority);
CREATE INDEX idx_surgeries_scheduled_start ON surgeries(scheduled_start);

-- ============================================================================
-- Table: surgeon_availability
-- ============================================================================
CREATE TABLE surgeon_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    surgeon_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT true,
    reason VARCHAR(50) CHECK (reason IN ('LEAVE', 'ON_CALL', 'TRAINING'))
);

CREATE INDEX idx_surgeon_availability_surgeon_id ON surgeon_availability(surgeon_id);
CREATE INDEX idx_surgeon_availability_date ON surgeon_availability(date);

-- ============================================================================
-- Table: sterilization_logs
-- ============================================================================
CREATE TABLE sterilization_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES operating_rooms(id) ON DELETE CASCADE,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED')),
    technician_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_sterilization_logs_room_id ON sterilization_logs(room_id);
CREATE INDEX idx_sterilization_logs_status ON sterilization_logs(status);
CREATE INDEX idx_sterilization_logs_start_time ON sterilization_logs(start_time);

-- ============================================================================
-- Table: notifications
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('INFO', 'WARNING', 'EMERGENCY', 'REMINDER')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    surgery_id UUID REFERENCES surgeries(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_surgery_id ON notifications(surgery_id);

