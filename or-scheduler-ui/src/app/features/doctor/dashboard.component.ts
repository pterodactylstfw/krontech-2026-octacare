import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/theme/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/enums/user-role.enum';
import { ScheduleService } from '../../core/services/schedule.service';
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
import { SurgeryService } from '../../core/services/surgery.service';
import { Surgery as BackendSurgery } from '../../shared/models/surgery.model';

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
export class DoctorDashboardComponent implements OnInit, OnDestroy {
  readonly theme = inject(ThemeService);
  private authService = inject(AuthService);
  private patientService = inject(PatientService);
  private chatService = inject(ChatService);
  private scheduleService = inject(ScheduleService);
  private surgeryService = inject(SurgeryService);

  private _scheduleSub: any = null;

  readonly today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  chatOpen = false;
  patientsLoading = false;
  patientsError: string | null = null;

  private _allPatients = signal<DoctorPatientSummary[]>([]);
  showAllPatients = signal<boolean>(false);
  private _recentPatients = signal<RecentPatient[]>([]);

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

  // ── Computed & Readonly ──────────────────────────────────────────────────
  readonly allPatients = this._allPatients.asReadonly();
  readonly todaySchedule = this._schedule.asReadonly();
  readonly alerts = this._alerts.asReadonly();
  
  readonly recentPatients = computed(() => {
    return this.showAllPatients() ? this._recentPatients() : this._recentPatients().slice(0, 3);
  });

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

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadTodaySchedule();

    this._scheduleSub = this.scheduleService.scheduleUpdated$.subscribe(() => {
      this.loadTodaySchedule();
    });

    this.surgeryService.getAll().subscribe({
      next: (response: any) => {
        const surgeries: BackendSurgery[] = Array.isArray(response) ? response : (response.content || response.data || []);
        this._recentPatients.set(this.mapRecentPatients(surgeries));
      },
      error: (err) => {
        console.error('❌ Error fetching recent patients:', err);
        this._recentPatients.set([]);
      }
    });
  }

  ngOnDestroy(): void {
    if (this._scheduleSub && typeof this._scheduleSub.unsubscribe === 'function') {
      this._scheduleSub.unsubscribe();
    }
  }

  // ── Public Methods ────────────────────────────────────────────────────────
  openChat(patient: RecentPatient): void {
    this.chatService.openConversation(patient.id, patient.name, patient.initials);
    this.chatOpen = true;
  }

  openAllPatients(): void {
    this.showAllPatients.set(true);
    if (!this._allPatients().length && !this.patientsLoading) {
      this.loadAllPatients();
    }
  }

  closeAllPatients(): void {
    this.showAllPatients.set(false);
  }

  toggleViewAll(): void {
    this.showAllPatients.set(!this.showAllPatients());
  }

  selectSurgery(surgery: Surgery): void {
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

  openPatientChat(patient: DoctorPatientSummary): void {
    this.chatService.openConversation(this.toThreadId(patient.id), patient.name, patient.initials);
    this.chatOpen = true;
    this.closeAllPatients();
  }

  // ── Private Helpers ───────────────────────────────────────────────────────
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

  private loadTodaySchedule(): void {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    this.scheduleService.getSchedule(this.formatLocalISO(start), this.formatLocalISO(end)).subscribe({
      next: (response: any) => {
        const surgeries: BackendSurgery[] = Array.isArray(response) ? response : (response.content || response.data || []);
        const role = this.authService.getCurrentUserRole();
        let filtered = surgeries;
        if (role === UserRole.SURGEON) {
          const surgeonName = this.getCurrentSurgeonName();
          if (surgeonName) {
            const byName = surgeries.filter(
              s => (s.surgeonName || '').toLowerCase() === surgeonName.toLowerCase()
            );
            filtered = byName.length > 0 ? byName : surgeries;
          }
        }
        this._schedule.set(this.mapTodaySchedule(filtered));
      },
      error: (err) => {
        console.error('❌ Error fetching today schedule:', err);
        this._schedule.set([]);
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
    return sorted
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
  }

  private mapTodaySchedule(surgeries: BackendSurgery[]): Surgery[] {
    return [...surgeries]
      .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
      .map((surgery) => ({
        id: this.toNumericId(surgery.id),
        procedureName: surgery.surgeryTypeName || 'Procedure',
        patientName: surgery.patientName || 'Unknown Patient',
        room: surgery.roomName || '—',
        type: this.getTimelineTypeLabel(surgery.surgeryTypeName),
        startTime: this.formatTime(surgery.scheduledStart),
        duration: this.diffInMinutes(surgery.scheduledStart, surgery.scheduledEnd),
        status: this.getTimelineStatus(surgery.status),
        notes: surgery.notes || '',
      }));
  }

  private getCurrentSurgeonName(): string | null {
    let current: any = null;
    this.authService.currentUser$.subscribe(user => { current = user; }).unsubscribe();
    return current?.fullName ?? null;
  }

  private getTimelineTypeLabel(surgeryTypeName?: string): string {
    const name = (surgeryTypeName || '').toLowerCase();
    if (!name) return 'General';
    if (name.includes('cardiac') || name.includes('bypass') || name.includes('valve')) return 'Cardiac';
    if (name.includes('brain') || name.includes('neuro')) return 'Neuro';
    if (name.includes('ortho') || name.includes('knee') || name.includes('hip')) return 'Orthopedic';
    return 'General';
  }

  private getTimelineStatus(status: string): Surgery['status'] {
    const normalized = (status || '').toLowerCase().replace(/_/g, '-');
    if (normalized === 'in-progress') return 'in-progress';
    if (normalized === 'completed') return 'completed';
    return 'scheduled';
  }

  private formatLocalISO(d: Date): string {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return d.getFullYear() + '-' +
      pad(d.getMonth() + 1) + '-' +
      pad(d.getDate()) + 'T' +
      pad(d.getHours()) + ':' +
      pad(d.getMinutes()) + ':' +
      pad(d.getSeconds());
  }

  private formatTime(iso: string): string {
    if (!iso) return '00:00';
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  private diffInMinutes(start: string, end: string): number {
    if (!start || !end) return 60;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return Math.max(15, Math.round((e - s) / 60000));
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
}
