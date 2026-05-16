import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/theme/theme.service';
import { PatientService } from '../patients/services/patient.service';
import { catchError, of } from 'rxjs';
import {
  DoctorProfile,
  DoctorStats,
  Surgery,
  OperatingRoomStatus,
  DoctorAlert,
  RecentPatient,
} from './doctor.models';
import { ChatComponent } from '../chat/chat.component';
import { ChatService } from '../chat/chat.service';

interface DoctorPatientSummary {
  id: string;
  initials: string;
  name: string;
  email: string;
  medicalRecordNumber: string;
  bloodType: string;
  phone: string;
}


@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, ChatComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DoctorDashboardComponent implements OnInit {
  readonly theme = inject(ThemeService);
  private patientService = inject(PatientService);
  private chatService = inject(ChatService);

  readonly today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  chatOpen = false;
  showAllPatients = false;
  patientsLoading = false;
  patientsError: string | null = null;

  private _allPatients = signal<DoctorPatientSummary[]>([]);

  // ── State ──────────────────────────────────────────────────────────────────
  doctor = signal<DoctorProfile>({
    id: 1,
    initials: 'IA',
    firstName: 'Alexandru',
    name: 'Dr. Ionescu Alexandru',
    specialty: 'Cardiac Surgery',
    department: 'Cardiology',
    color: '#1d4ed8',
    successRate: 98.2,
  });

  private _alerts = signal<DoctorAlert[]>([
    { id: 1, severity: 'critical', message: 'OR 1 equipment check overdue', time: '3h ago' },
    { id: 2, severity: 'warning', message: 'Patient Popa I. — pre-op labs pending', time: '1h ago' },
    { id: 3, severity: 'info', message: '2 surgeries pending approval', time: 'Just now' },
  ]);

  openChat(patient: RecentPatient): void {
    this.chatService.openConversation(patient.id, patient.name, patient.initials);
    this.chatOpen = true;
  }

  openAllPatients(): void {
    this.showAllPatients = true;

    if (!this._allPatients().length && !this.patientsLoading) {
      this.loadAllPatients();
    }
  }

  closeAllPatients(): void {
    this.showAllPatients = false;
  }

  private loadAllPatients(): void {
    this.patientsLoading = true;
    this.patientsError = null;

    this.patientService.getAllPatients().pipe(
      catchError((error) => {
        console.error('❌ DoctorDashboard: Failed to load patients', error);
        this.patientsError = 'Could not load patients right now.';
        return of([]);
      })
    ).subscribe((patients: any[]) => {
      this._allPatients.set((patients ?? []).map((patient) => this.mapPatient(patient)));
      this.patientsLoading = false;
    });
  }

  private mapPatient(patient: any): DoctorPatientSummary {
    const fullName = patient?.fullName ?? 'Unknown patient';
    return {
      id: String(patient?.id ?? patient?.userId ?? fullName),
      initials: this.getInitials(fullName),
      name: fullName,
      email: patient?.email ?? 'No email',
      medicalRecordNumber: patient?.medicalRecordNumber ?? 'MRN unavailable',
      bloodType: patient?.bloodType ?? 'Blood type unknown',
      phone: patient?.phone ?? 'No phone'
    };
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  private toThreadId(source: string): number {
    return Array.from(source).reduce((hash, char) => {
      return ((hash << 5) - hash + char.charCodeAt(0)) | 0;
    }, 0);
  }

  openPatientChat(patient: DoctorPatientSummary): void {
    this.chatService.openConversation(this.toThreadId(patient.id), patient.name, patient.initials);
    this.chatOpen = true;
    this.closeAllPatients();
  }

  readonly allPatients = this._allPatients.asReadonly();

  private _schedule = signal<Surgery[]>([
    {
      id: 1, procedureName: 'Appendectomy', patientName: 'Gheorghe Mihai',
      room: 'OR 1', type: 'General', startTime: '08:00', duration: 90,
      status: 'completed', notes: '',
    },
    {
      id: 2, procedureName: 'Coronary Bypass', patientName: 'Popa Ion',
      room: 'OR 1', type: 'Cardiac', startTime: '10:30', duration: 180,
      status: 'in-progress', notes: '⚠ Pre-op labs not confirmed',
    },
    {
      id: 3, procedureName: 'Aortic Valve Repair', patientName: 'Dumitru Elena',
      room: 'OR 1', type: 'Cardiac', startTime: '14:00', duration: 120,
      status: 'scheduled', notes: '',
    },
  ]);

  private _recentPatients = signal<RecentPatient[]>([
    { id: 1, initials: 'GM', name: 'Gheorghe Mihai', procedure: 'Appendectomy', date: 'Today', outcome: 'good', outcomeLabel: 'Successful' },
    { id: 2, initials: 'NR', name: 'Nicolae Radu', procedure: 'Bypass x3', date: 'Yesterday', outcome: 'good', outcomeLabel: 'Successful' },
    { id: 3, initials: 'SD', name: 'Stan Diana', procedure: 'Valve Repair', date: '28 Apr', outcome: 'warning', outcomeLabel: 'Monitoring' },
  ]);

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly todaySchedule = this._schedule.asReadonly();
  readonly alerts = this._alerts.asReadonly();
  readonly recentPatients = this._recentPatients.asReadonly();


  readonly stats = computed<DoctorStats>(() => {
    const schedule = this._schedule();
    const completed = schedule.filter(s => s.status === 'completed').length;
    const next = schedule.find(s => s.status === 'scheduled');
    return {
      surgeriesToday: schedule.length,
      completed,
      nextTime: next?.startTime ?? '—',
      nextRoom: next?.room ?? '—',
      orStatus: 'Active',
      orName: 'OR 1 · Floor 2',
    };
  });

  readonly currentOr = signal<OperatingRoomStatus>({
    name: 'OR 1 · Cardiac · Floor 2',
    status: 'active',
    statusLabel: 'Active',
    utilization: 75,
    floor: 'Floor 2',
    currentPatient: 'Popa Ion',
    nextAt: '14:00',
  });

  // ── Methods ────────────────────────────────────────────────────────────────
  selectSurgery(surgery: Surgery): void {
    // Will navigate to surgery detail when backend is ready
    console.log('Selected surgery:', surgery.id);
  }

  dismissAlert(id: number): void {
    this._alerts.update(list => list.filter(a => a.id !== id));
  }

  getStatusLabel(status: Surgery['status']): string {
    const map: Record<Surgery['status'], string> = {
      'in-progress': 'In Progress',
      'scheduled': 'Scheduled',
      'completed': 'Completed',
    };
    return map[status];
  }

  getOrStatusClass(status: string): string {
    if (status === 'Active') return 'status-busy';
    if (status === 'Available') return 'status-available';
    return 'status-sterilizing';
  }

  ngOnInit(): void { }
}
