export interface ReportKpi {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface MonthlyUtilization {
  month: string;
  utilizationPct: number;
  targetPct: number;
}

export interface DepartmentReportRow {
  department: string;
  completed: number;
  avgDurationMinutes: number;
  onTimeRatePct: number;
  cancellationRatePct: number;
}

export interface Bottleneck {
  title: string;
  detail: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ReportsData {
  title: string;
  generatedAt: string;
  period: string;
  kpis: ReportKpi[];
  utilizationByMonth: MonthlyUtilization[];
  departmentRows: DepartmentReportRow[];
  bottlenecks: Bottleneck[];
  recommendations: string[];
}

