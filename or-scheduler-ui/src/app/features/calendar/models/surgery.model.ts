export type SurgeryStatus = 'scheduled' | 'in-progress' | 'completed' | 'emergency' | 'sterilization';

export interface Surgery {
  id: string;
  patientId: string;
  surgeonName: string;
  surgeonInitials: string;
  type: string;
  orRoom: 'OR 1' | 'OR 2' | 'OR 3' | 'OR 4';
  startTime: string;   // "08:00"
  endTime: string;     // "09:30"
  durationMin: number;
  status: SurgeryStatus;
  color?: string;
}

export interface ORRoom {
  id: string;
  name: string;
  utilizationPercent: number;
}