export type AvailabilityReason = 'LEAVE' | 'ON_CALL' | 'TRAINING' | null;

export interface SurgeonAvailability {
  id: string;
  surgeonId: string;
  surgeonName: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason: AvailabilityReason;
}

export interface SurgeonAvailabilityRequest {
  surgeonId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason: AvailabilityReason;
}

export interface AvailabilityStats {
  totalEntries: number;
  available: number;
  unavailable: number;
  uniqueSurgeons: number;
}