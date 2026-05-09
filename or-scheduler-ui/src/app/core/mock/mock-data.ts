import { UserRole } from '../enums/user-role.enum';
import { RoomStatus } from '../enums/room-status.enum';
import { SurgeryStatus } from '../enums/surgery-status.enum';
import { SurgeryPriority } from '../enums/surgery-priority.enum';
import { User } from '../../shared/models/user.model';
import { OperatingRoom } from '../../shared/models/room.model';
import { Surgery } from '../../shared/models/surgery.model';
import { Notification } from '../../shared/models/notification.model';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@hospital.com',
    fullName: 'Hospital Administrator',
    role: UserRole.ADMIN,
    department: 'Management'
  },
  {
    id: '2',
    email: 'ionescu@hospital.com',
    fullName: 'Dr. Ionescu Alexandru',
    role: UserRole.SURGEON,
    specialization: 'Cardiac surgery',
    department: 'Cardiology'
  },
  {
    id: '3',
    email: 'popescu@hospital.com',
    fullName: 'Dr. Popescu Maria',
    role: UserRole.SURGEON,
    specialization: 'Neurosurgery',
    department: 'Neurology'
  },
  {
    id: '4',
    email: 'nurse@hospital.com',
    fullName: 'Ionescu Elena',
    role: UserRole.NURSE,
    department: 'Cardiology'
  },
  {
    id: '5',
    email: 'patient@gmail.com',
    fullName: 'Gheorghe Ion',
    role: UserRole.PATIENT
  }
];

export const MOCK_ROOMS: OperatingRoom[] = [
  {
    id: '1',
    name: 'Operating Room 1',
    roomType: 'CARDIAC',
    status: RoomStatus.AVAILABLE,
    floor: 2,
    sterilizationTimeMinutes: 45,
    equipment: ['ECG', 'Defibrillator', 'Bypass'],
    capacity: 6
  },
  {
    id: '2',
    name: 'Operating Room 2',
    roomType: 'GENERAL',
    status: RoomStatus.OCCUPIED,
    floor: 2,
    sterilizationTimeMinutes: 30,
    equipment: ['Anesthesia', 'Monitor'],
    capacity: 5
  },
  {
    id: '3',
    name: 'Operating Room 3',
    roomType: 'NEURO',
    status: RoomStatus.STERILIZING,
    floor: 3,
    sterilizationTimeMinutes: 60,
    equipment: ['Neuronavigation', 'Microscope'],
    capacity: 7
  }
];

export const MOCK_SURGERIES: Surgery[] = [
  {
    id: '1',
    patientId: '5',
    patientName: 'Gheorghe Ion',
    surgeonId: '2',
    surgeonName: 'Dr. Ionescu Alexandru',
    roomId: '1',
    roomName: 'Operating Room 1',
    surgeryTypeId: '1',
    surgeryTypeName: 'Cardiac Bypass',
    scheduledStart: '2026-04-22T08:00:00',
    scheduledEnd: '2026-04-22T10:00:00',
    status: SurgeryStatus.SCHEDULED,
    priority: SurgeryPriority.ELECTIVE,
    createdAt: '2026-04-20T10:00:00'
  },
  {
    id: '2',
    patientId: '5',
    patientName: 'Gheorghe Ion',
    surgeonId: '2',
    surgeonName: 'Dr. Ionescu Alexandru',
    roomId: '2',
    roomName: 'Operating Room 2',
    surgeryTypeId: '2',
    surgeryTypeName: 'Appendectomy',
    scheduledStart: '2026-04-22T11:00:00',
    scheduledEnd: '2026-04-22T13:00:00',
    status: SurgeryStatus.IN_PROGRESS,
    priority: SurgeryPriority.URGENT,
    createdAt: '2026-04-20T11:00:00'
  },
  {
    id: '3',
    patientId: '5',
    patientName: 'Gheorghe Ion',
    surgeonId: '3',
    surgeonName: 'Dr. Popescu Maria',
    roomId: '3',
    roomName: 'Operating Room 3',
    surgeryTypeId: '3',
    surgeryTypeName: 'Brain Tumor Removal',
    scheduledStart: '2026-04-23T09:00:00',
    scheduledEnd: '2026-04-23T11:30:00',
    status: SurgeryStatus.SCHEDULED,
    priority: SurgeryPriority.EMERGENCY,
    createdAt: '2026-04-21T08:00:00'
  },
  {
    id: '4',
    patientId: '5',
    patientName: 'Gheorghe Ion',
    surgeonId: '2',
    surgeonName: 'Dr. Ionescu Alexandru',
    roomId: '1',
    roomName: 'Operating Room 1',
    surgeryTypeId: '1',
    surgeryTypeName: 'Cardiac Bypass',
    scheduledStart: '2026-05-05T10:00:00',
    scheduledEnd: '2026-05-05T12:00:00',
    status: SurgeryStatus.SCHEDULED,
    priority: SurgeryPriority.ELECTIVE,
    createdAt: '2026-04-25T09:00:00'
  },
  {
    id: '5',
    patientId: '5',
    patientName: 'Gheorghe Ion',
    surgeonId: '3',
    surgeonName: 'Dr. Popescu Maria',
    roomId: '2',
    roomName: 'Operating Room 2',
    surgeryTypeId: '2',
    surgeryTypeName: 'Appendectomy',
    scheduledStart: '2026-05-12T14:30:00',
    scheduledEnd: '2026-05-12T16:00:00',
    status: SurgeryStatus.SCHEDULED,
    priority: SurgeryPriority.URGENT,
    createdAt: '2026-04-26T10:00:00'
  },
  {
    id: '6',
    patientId: '5',
    patientName: 'Gheorghe Ion',
    surgeonId: '2',
    surgeonName: 'Dr. Ionescu Alexandru',
    roomId: '1',
    roomName: 'Operating Room 1',
    surgeryTypeId: '1',
    surgeryTypeName: 'Cardiac Bypass',
    scheduledStart: '2026-02-10T08:00:00',
    scheduledEnd: '2026-02-10T10:30:00',
    status: SurgeryStatus.COMPLETED,
    priority: SurgeryPriority.ELECTIVE,
    createdAt: '2026-02-01T10:00:00'
  },
  {
    id: '7',
    patientId: '5',
    patientName: 'Gheorghe Ion',
    surgeonId: '3',
    surgeonName: 'Dr. Popescu Maria',
    roomId: '3',
    roomName: 'Operating Room 3',
    surgeryTypeId: '3',
    surgeryTypeName: 'Brain Tumor Removal',
    scheduledStart: '2025-11-22T09:00:00',
    scheduledEnd: '2025-11-22T11:00:00',
    status: SurgeryStatus.COMPLETED,
    priority: SurgeryPriority.URGENT,
    createdAt: '2025-11-15T08:00:00'
  },
  {
    id: '8',
    patientId: '5',
    patientName: 'Gheorghe Ion',
    surgeonId: '2',
    surgeonName: 'Dr. Ionescu Alexandru',
    roomId: '2',
    roomName: 'Operating Room 2',
    surgeryTypeId: '2',
    surgeryTypeName: 'Appendectomy',
    scheduledStart: '2025-09-14T13:00:00',
    scheduledEnd: '2025-09-14T14:30:00',
    status: SurgeryStatus.CANCELLED,
    priority: SurgeryPriority.ELECTIVE,
    createdAt: '2025-09-01T08:00:00'
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    userId: '2',
    type: 'EMERGENCY',
    message: 'Emergency surgery added in Operating Room 1 at 2:00 PM',
    isRead: false,
    surgeryId: '3',
    createdAt: '2026-04-22T13:45:00'
  },
  {
    id: '2',
    userId: '2',
    type: 'REMINDER',
    message: 'Scheduled surgery tomorrow at 8:00 AM in Operating Room 1',
    isRead: true,
    surgeryId: '1',
    createdAt: '2026-04-21T18:00:00'
  }
];
