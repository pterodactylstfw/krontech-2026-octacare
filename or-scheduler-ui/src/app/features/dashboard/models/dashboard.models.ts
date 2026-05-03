export interface KpiCard {
  label: string;
  value: string;
  delta: string;
  deltaType: 'up' | 'down' | 'neutral';
  accent: 'blue' | 'green' | 'amber' | 'red';
}

export interface OperatingRoomStatus {
  id: number;
  name: string;
  specialty: string;
  floor: string;
  utilization: number;
  status: 'active' | 'sterilizing' | 'available' | 'maintenance';
  currentSurgeon?: string;
  endsAt?: string;
  nextSurgeon?: string;
  nextTime?: string;
}

export interface SurgeonStat {
  initials: string;
  name: string;
  department: string;
  surgeriesToday: number;
  colorClass: 'blue' | 'purple' | 'teal' | 'amber';
  status: 'on-duty' | 'on-leave' | 'off-duty';
}

export interface Alert {
  id: number;
  message: string;
  detail: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface TimelineBlock {
  procedureName: string;
  surgeon: string;
  colorType: 'blue' | 'teal' | 'purple' | 'red' | 'amber' | 'empty';
  hasAlert?: boolean;
}

export interface TimelineRow {
  hour: string;
  or1: TimelineBlock;
  or2: TimelineBlock;
  or3: TimelineBlock;
  or4: TimelineBlock;
}

export interface MiniStat {
  label: string;
  value: string;
  subtext: string;
  progressPct: number;
  colorClass: 'blue' | 'green' | 'amber';
}

export interface DashboardData {
  kpis: KpiCard[];
  operatingRooms: OperatingRoomStatus[];
  surgeons: SurgeonStat[];
  alerts: Alert[];
  timeline: TimelineRow[];
  miniStats: MiniStat[];
  aiInsight: string;
}