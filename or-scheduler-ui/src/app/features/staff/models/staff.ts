export interface Staff {
  id: number;
  name: string;
  role: 'Surgeon' | 'Nurse';
  specialty: string;
  department: string;
  status: 'On Duty' | 'On Leave' | 'Off Duty';
  initials: string;
  color: string;
  surgeriesOrRoom?: string;
  nextSurgeryOrShift?: string;
  shift?: string;
  weekDays: boolean[];
}