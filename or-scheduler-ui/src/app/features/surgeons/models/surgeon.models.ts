export interface Surgeon {
  id: number;
  initials: string;
  name: string;
  specialty: string;
  department: string;
  status: 'on-duty' | 'on-leave' | 'off-duty';
  color: string;
  surgeriesToday: number;
  surgeriesWeek: number;
  successRate: number;
  nextSurgery?: string;
  nextRoom?: string;
  weekDays: boolean[]; // [M, T, W, T, F]
  yearsExperience: number;
  certifications: string[];
}

export interface SurgeonStats {
  total: number;
  onDuty: number;
  onLeave: number;
  surgeriesToday: number;
}

export type SurgeonFilter = 'All' | 'On Duty' | 'On Leave' | 'Off Duty';
export type SurgeonDepartment = 'All' | 'Cardiology' | 'Neurology' | 'Orthopedics' | 'General' | 'Pediatrics';