export type ScheduleStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface ScheduleGeneration {
  id: string;
  generatedAt: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  status: ScheduleStatus;
  algorithmParams: {
    alpha: number;
    beta: number;
    gamma: number;
    delta: number;
  };
  resultScore?: number;
  acceptedBy?: string;
  acceptedAt?: string;
}
