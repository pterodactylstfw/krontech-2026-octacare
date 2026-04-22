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
    email: 'admin@spital.ro',
    fullName: 'Admin Spital',
    role: UserRole.ADMIN,
    department: 'Management'
  },
  {
    id: '2',
    email: 'ionescu@spital.ro',
    fullName: 'Dr. Ionescu Alexandru',
    role: UserRole.SURGEON,
    specialization: 'Cardiac',
    department: 'Cardiologie'
  },
  {
    id: '3',
    email: 'popescu@spital.ro',
    fullName: 'Dr. Popescu Maria',
    role: UserRole.SURGEON,
    specialization: 'Neuro',
    department: 'Neurologie'
  },
  {
    id: '4',
    email: 'asistenta@spital.ro',
    fullName: 'Ionescu Elena',
    role: UserRole.NURSE,
    department: 'Cardiologie'
  },
  {
    id: '5',
    email: 'pacient@gmail.com',
    fullName: 'Gheorghe Ion',
    role: UserRole.PATIENT
  }
];

export const MOCK_ROOMS: OperatingRoom[] = [
  {
    id: '1',
    name: 'Sala 1',
    roomType: 'CARDIAC',
    status: RoomStatus.AVAILABLE,
    floor: 2,
    sterilizationTimeMinutes: 45,
    equipment: ['ECG', 'Defibrilator', 'Bypass'],
    capacity: 6
  },
  {
    id: '2',
    name: 'Sala 2',
    roomType: 'GENERAL',
    status: RoomStatus.OCCUPIED,
    floor: 2,
    sterilizationTimeMinutes: 30,
    equipment: ['Anestezie', 'Monitor'],
    capacity: 5
  },
  {
    id: '3',
    name: 'Sala 3',
    roomType: 'NEURO',
    status: RoomStatus.STERILIZING,
    floor: 3,
    sterilizationTimeMinutes: 60,
    equipment: ['Neuronavigatie', 'Microscop'],
    capacity: 7
  }
];

export const MOCK_SURGERIES: Surgery[] = [
  {
    id: '1',
    patientId: '5',
    surgeonId: '2',
    roomId: '1',
    surgeryTypeId: '1',
    scheduledStart: '2026-04-22T08:00:00',
    scheduledEnd: '2026-04-22T10:00:00',
    status: SurgeryStatus.SCHEDULED,
    priority: SurgeryPriority.ELECTIVE,
    createdAt: '2026-04-20T10:00:00'
  },
  {
    id: '2',
    patientId: '5',
    surgeonId: '2',
    roomId: '2',
    surgeryTypeId: '2',
    scheduledStart: '2026-04-22T11:00:00',
    scheduledEnd: '2026-04-22T13:00:00',
    status: SurgeryStatus.IN_PROGRESS,
    priority: SurgeryPriority.URGENT,
    createdAt: '2026-04-20T11:00:00'
  },
  {
    id: '3',
    patientId: '5',
    surgeonId: '3',
    roomId: '3',
    surgeryTypeId: '3',
    scheduledStart: '2026-04-23T09:00:00',
    scheduledEnd: '2026-04-23T11:30:00',
    status: SurgeryStatus.SCHEDULED,
    priority: SurgeryPriority.EMERGENCY,
    createdAt: '2026-04-21T08:00:00'
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    userId: '2',
    type: 'EMERGENCY',
    message: 'Operatie de urgenta adaugata in Sala 1 la 14:00',
    isRead: false,
    surgeryId: '3',
    createdAt: '2026-04-22T13:45:00'
  },
  {
    id: '2',
    userId: '2',
    type: 'REMINDER',
    message: 'Operatie programata maine la 08:00 in Sala 1',
    isRead: true,
    surgeryId: '1',
    createdAt: '2026-04-21T18:00:00'
  }
];
