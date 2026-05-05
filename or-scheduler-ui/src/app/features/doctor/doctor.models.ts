export interface DoctorProfile {
  id: number;
  initials: string;
  firstName: string;
  name: string;
  specialty: string;
  department: string;
  color: string;
  successRate: number;
}

export interface DoctorStats {
  surgeriesToday: number;
  completed: number;
  nextTime: string;
  nextRoom: string;
  orStatus: string;
  orName: string;
}

export interface Surgery {
  id: number;
  procedureName: string;
  patientName: string;
  room: string;
  type: string;
  startTime: string;
  duration: number; // minutes
  status: 'scheduled' | 'in-progress' | 'completed';
  notes: string;
}

export interface OperatingRoomStatus {
  name: string;
  status: 'active' | 'sterilizing' | 'available';
  statusLabel: string;
  utilization: number;
  floor: string;
  currentPatient: string | null;
  nextAt: string | null;
}

export interface DoctorAlert {
  id: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
}

export interface RecentPatient {
  id: number;
  initials: string;
  name: string;
  procedure: string;
  date: string;
  outcome: 'good' | 'warning' | 'critical';
  outcomeLabel: string;
}