export interface NurseProfile {
  id: number;
  initials: string;
  firstName: string;
  name: string;
  unit: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
}

export interface NurseStats {
  totalTasks: number;
  completedTasks: number;
  patientsCount: number;
  roomsReady: number;
  roomsTotal: number;
  equipmentAlerts: number;
}

export interface NurseTask {
  id: number;
  name: string;
  room: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'done';
  patient: string | null;
}

export type NurseTaskFilter = 'All' | 'Pending' | 'Done';

export interface RoomStatus {
  id: number;
  name: string;
  specialty: string;
  floor: string;
  utilization: number;
  status: 'active' | 'sterilizing' | 'available';
  statusLabel: string;
}

export interface ShiftPatient {
  id: number;
  initials: string;
  name: string;
  room: string;
  procedure: string;
  status: 'pre-op' | 'in-or' | 'recovery' | 'discharge';
  statusLabel: string;
  time: string;
}

export interface EquipmentAlert {
  id: number;
  equipment: string;
  description: string;
  room: string;
  severity: 'critical' | 'warning';
}