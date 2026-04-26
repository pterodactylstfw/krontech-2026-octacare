import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ReportsData } from '../models/reports.models';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  getReportsData(): Observable<ReportsData> {
    return of({
      title: 'Monthly Analytics',
      generatedAt: new Date().toISOString(),
      period: 'October 2026',
      kpis: [
        { label: 'OR Utilization', value: '78%', delta: '+2%', trend: 'up' },
        { label: 'Cancellations', value: '12', delta: '-3', trend: 'down' },
        { label: 'On-Time Starts', value: '85%', delta: '+5%', trend: 'up' }
      ],
      utilizationByMonth: [
        { month: 'Jul', utilizationPct: 70, targetPct: 80 },
        { month: 'Aug', utilizationPct: 75, targetPct: 80 },
        { month: 'Sep', utilizationPct: 76, targetPct: 80 },
        { month: 'Oct', utilizationPct: 78, targetPct: 80 }
      ],
      departmentRows: [
        { department: 'Orthopedics', completed: 42, avgDurationMinutes: 120, onTimeRatePct: 88, cancellationRatePct: 5 },
        { department: 'General Surgery', completed: 35, avgDurationMinutes: 90, onTimeRatePct: 80, cancellationRatePct: 8 }
      ],
      bottlenecks: [
        { title: 'Room Turnaround Time', detail: 'Average turnaround is 25 minutes (target 15m).', severity: 'medium' }
      ],
      recommendations: [
        'Review sterile processing procedures to reduce turnaround delays.',
        'Increase staffing during peak hours (8 AM - 11 AM).'
      ]
    });
  }
}

