import { RoomStatus } from '../../core/enums/room-status.enum';

export type RoomType = 'GENERAL' | 'CARDIAC' | 'NEURO' | 'ORTHOPEDIC' | 'PEDIATRIC';

export interface OperatingRoom {
  id: string;
  name: string;
  roomType: RoomType;
  status: RoomStatus;
  floor: number;
  sterilizationTimeMinutes: number;
  equipment: string[];
  capacity: number;
}
