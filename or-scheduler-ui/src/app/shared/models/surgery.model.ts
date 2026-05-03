import { SurgeryStatus } from '../../core/enums/surgery-status.enum';
import { SurgeryPriority } from '../../core/enums/surgery-priority.enum';

export interface Surgery {
  id: string;
  patientId: string;
  surgeonId: string;
  roomId: string;
  surgeryTypeId: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: SurgeryStatus;
  priority: SurgeryPriority;
  notes?: string;
  createdAt: string;
}
