import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/theme/theme.service';
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
import { SurgeryService } from '../../core/services/surgery.service';
import { Surgery as BackendSurgery } from '../../shared/models/surgery.model';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, ChatComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DoctorDashboardComponent implements OnInit {
  readonly theme = inject(ThemeService);
  private chatService = inject(ChatService);
  private surgeryService = inject(SurgeryService);

  readonly today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  chatOpen = false;

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

  selectedPatient: { name: string; initials: string } | null = null;

  openChat(patient: RecentPatient): void {
    this.selectedPatient = { name: patient.name, initials: patient.initials };
    this.chatService.openConversation(patient.id, patient.name, patient.initials);
    this.chatOpen = true;
  }

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

  private _recentPatients = signal<RecentPatient[]>([]);

  showAllPatients = signal<boolean>(false);

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly todaySchedule = this._schedule.asReadonly();
  readonly alerts = this._alerts.asReadonly();
  readonly recentPatients = computed(() => {
    return this.showAllPatients() ? this._recentPatients() : this._recentPatients().slice(0, 3);
  });

  readonly unreadCount = computed(() => this._alerts().length);

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

  toggleViewAll(): void {
    this.showAllPatients.set(!this.showAllPatients());
  }

  ngOnInit(): void {
    this.surgeryService.getAll().subscribe({
      next: (response: any) => {
        const surgeries: BackendSurgery[] = Array.isArray(response) ? response : (response.content || response.data || []);
        this._recentPatients.set(this.mapRecentPatients(surgeries));
      },
      error: (err) => {
        console.error('Eroare la preluarea pacientilor recenti din surgeries:', err);
        this._recentPatients.set([]);
      }
    });
  }

  private mapRecentPatients(surgeries: BackendSurgery[]): RecentPatient[] {
    const sorted = [...surgeries].sort((a, b) => {
      const aTime = new Date(a.scheduledStart).getTime();
      const bTime = new Date(b.scheduledStart).getTime();
      return bTime - aTime;
    });

    const seen = new Set<string>();
    const recent = sorted
      .filter(surgery => {
        const key = surgery.patientId || surgery.patientName;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 6)
      .map((surgery) => {
        const patientKey = surgery.patientId || surgery.patientName || surgery.id;
        return {
          id: this.toNumericId(patientKey),
          initials: this.getInitials(surgery.patientName || 'Unknown Patient'),
          name: surgery.patientName || 'Unknown Patient',
          procedure: surgery.surgeryTypeName || 'Consultation',
          date: this.formatRecentDate(surgery.scheduledStart),
          outcome: this.getOutcomeFromStatus(surgery.status),
          outcomeLabel: this.getOutcomeLabelFromStatus(surgery.status),
        } satisfies RecentPatient;
      });

    return recent;
  }

  private getOutcomeFromStatus(status: string): RecentPatient['outcome'] {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'completed') return 'good';
    if (normalized === 'emergency') return 'critical';
    return 'warning';
  }

  private getOutcomeLabelFromStatus(status: string): string {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'completed') return 'Successful';
    if (normalized === 'emergency') return 'Urgent';
    if (normalized === 'in-progress') return 'In Progress';
    return 'Monitoring';
  }

  private formatRecentDate(iso: string): string {
    if (!iso) return 'Recent';
    const date = new Date(iso);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  private toNumericId(value: string): number {
    return Math.abs(Array.from(value).reduce((acc, char) => ((acc * 31) + char.charCodeAt(0)) | 0, 0));
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
