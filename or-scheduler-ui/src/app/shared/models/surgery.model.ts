import { SurgeryStatus } from '../../core/enums/surgery-status.enum';
import { SurgeryPriority } from '../../core/enums/surgery-priority.enum';

export interface Surgery {
  id: string;
  patientId: string;
  patientName: string;
  surgeonId: string;
  surgeonName: string;
  roomId: string;
  roomName: string;
  surgeryTypeId: string;
  surgeryTypeName: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: SurgeryStatus | string;
  priority: SurgeryPriority | string;
  notes?: string;
  createdAt: string;
}

/** DTO pentru crearea/actualizarea unei operații */
export interface SurgeryRequest {
  patientId: string;
  surgeonId: string;
  roomId: string;
  surgeryTypeId: string;
  scheduledStart: string;
  scheduledEnd: string;
  priority: string;
  notes?: string;
}

/** DTO pentru reprogramare */
export interface SurgeryRescheduleRequest {
  newStart: string;
  newEnd: string;
}

