import { Injectable, signal } from '@angular/core';
import { DashboardData } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  // Când backend-ul e gata, înlocuiești getMockData() cu un HttpClient.get<DashboardData>('/api/dashboard')
  // și expui același semnal. Componenta nu trebuie modificată deloc.

  private _data = signal<DashboardData>(this.getMockData());
  readonly data = this._data.asReadonly();

  private getMockData(): DashboardData {
    return {
      kpis: [
        { label: 'Surgeries Today', value: '9', delta: '↑ 2 vs yesterday', deltaType: 'up', accent: 'blue' },
        { label: 'OR Utilization', value: '64%', delta: '↑ 8% vs last week', deltaType: 'up', accent: 'green' },
        { label: 'Staff On Duty', value: '4 / 6', delta: '1 on leave today', deltaType: 'neutral', accent: 'amber' },
        { label: 'Critical Alerts', value: '2', delta: 'Requires attention', deltaType: 'down', accent: 'red' },
      ],
      operatingRooms: [
        { id: 1, name: 'OR 1', specialty: 'Cardiac', floor: 'Floor 2', utilization: 75, status: 'active', currentSurgeon: 'Dr. Ionescu', endsAt: '13:00' },
        { id: 2, name: 'OR 2', specialty: 'General', floor: 'Floor 2', utilization: 96, status: 'active', currentSurgeon: 'Dr. Patel', endsAt: '09:30' },
        { id: 3, name: 'OR 3', specialty: 'Neuro', floor: 'Floor 3', utilization: 60, status: 'sterilizing', nextSurgeon: 'Dr. Popescu', nextTime: '11:30' },
        { id: 4, name: 'OR 4', specialty: 'Ortho', floor: 'Floor 1', utilization: 23, status: 'available' },
      ],
      surgeons: [
        { initials: 'IA', name: 'Dr. Ionescu Alexandru', department: 'Cardiology', surgeriesToday: 3, colorClass: 'blue', status: 'on-duty' },
        { initials: 'PM', name: 'Dr. Popescu Maria', department: 'Neurology', surgeriesToday: 2, colorClass: 'purple', status: 'on-duty' },
        { initials: 'PS', name: 'Dr. Patel Sanjay', department: 'General', surgeriesToday: 2, colorClass: 'teal', status: 'on-duty' },
        { initials: 'DC', name: 'Dr. Dumitru Constantin', department: 'Orthopedics', surgeriesToday: 0, colorClass: 'amber', status: 'on-leave' },
      ],
      alerts: [
        { id: 1, message: 'OR 4 equipment check overdue', detail: 'Defibrillator calibration · 3h ago', severity: 'critical' },
        { id: 2, message: 'Scheduling conflict detected', detail: 'Dr. Patel double-booked · 10:00', severity: 'critical' },
        { id: 3, message: 'OR 3 sterilization delayed', detail: '+15 min behind schedule', severity: 'warning' },
        { id: 4, message: '3 surgeries pending approval', detail: 'Added by Dr. Smith · Today', severity: 'info' },
      ],
      timeline: [
        {
          hour: '07:00',
          or1: { procedureName: '', surgeon: '', colorType: 'empty' },
          or2: { procedureName: '', surgeon: '', colorType: 'empty' },
          or3: { procedureName: '', surgeon: '', colorType: 'empty' },
          or4: { procedureName: '', surgeon: '', colorType: 'empty' },
        },
        {
          hour: '08:00',
          or1: { procedureName: 'Appendectomy', surgeon: 'Dr. Smith', colorType: 'blue' },
          or2: { procedureName: 'Knee Replacement', surgeon: 'Dr. Patel', colorType: 'teal' },
          or3: { procedureName: 'Knee Replacement', surgeon: 'Dr. Patel', colorType: 'teal' },
          or4: { procedureName: '', surgeon: '', colorType: 'empty' },
        },
        {
          hour: '09:00',
          or1: { procedureName: '', surgeon: '', colorType: 'empty' },
          or2: { procedureName: '', surgeon: '', colorType: 'empty' },
          or3: { procedureName: 'Sterilizing', surgeon: '', colorType: 'amber' },
          or4: { procedureName: '', surgeon: '', colorType: 'empty' },
        },
        {
          hour: '10:00',
          or1: { procedureName: 'Appendectomy', surgeon: 'Dr. Smith', colorType: 'blue' },
          or2: { procedureName: '', surgeon: '', colorType: 'empty' },
          or3: { procedureName: '', surgeon: '', colorType: 'empty' },
          or4: { procedureName: 'Heart Bypass', surgeon: 'Dr. Ionescu', colorType: 'red', hasAlert: true },
        },
        {
          hour: '11:00',
          or1: { procedureName: '', surgeon: '', colorType: 'empty' },
          or2: { procedureName: 'Craniotomy', surgeon: 'Dr. Popescu', colorType: 'purple' },
          or3: { procedureName: '', surgeon: '', colorType: 'empty' },
          or4: { procedureName: '', surgeon: '', colorType: 'empty' },
        },
        {
          hour: '12:00',
          or1: { procedureName: '', surgeon: '', colorType: 'empty' },
          or2: { procedureName: 'Dr. Ionescu', surgeon: '', colorType: 'blue' },
          or3: { procedureName: '', surgeon: '', colorType: 'empty' },
          or4: { procedureName: '', surgeon: '', colorType: 'empty' },
        },
        {
          hour: '13:00',
          or1: { procedureName: '', surgeon: '', colorType: 'empty' },
          or2: { procedureName: '', surgeon: '', colorType: 'empty' },
          or3: { procedureName: '', surgeon: '', colorType: 'empty' },
          or4: { procedureName: 'Scheduled', surgeon: '', colorType: 'amber' },
        },
      ],
      miniStats: [
        { label: 'Weekly surgeries', value: '47', subtext: 'Target: 60 · 78% complete', progressPct: 78, colorClass: 'blue' },
        { label: 'Avg. procedure time', value: '1h 42m', subtext: '↓ 8 min vs last week', progressPct: 60, colorClass: 'green' },
        { label: 'Patient turnover', value: '92%', subtext: 'On-time discharge rate', progressPct: 92, colorClass: 'amber' },
      ],
      aiInsight: 'OR 4 underutilized 3 days in a row. Consider rescheduling maintenance to off-peak hours to improve weekly throughput.'
    };
  }
}