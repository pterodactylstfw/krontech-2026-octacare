import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Surgery, ORRoom } from '../models/surgery.model';
import { SurgeryRequest } from '../../../shared/models/surgery.model';
import { OperatingRoom } from '../../../shared/models/room.model';
import { ThemeService } from '../../../core/theme/theme.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { RoomService } from '../../../core/services/room.service';
import { UserService, UserRole, UserResponse } from '../../../core/services/user.service';
import { PatientService } from '../../patients/services/patient.service';
import { SurgeryTypeService, SurgeryTypeResponse } from '../../../core/services/surgery-type.service';
import { SurgeryService } from '../../../core/services/surgery.service';


@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar-view.html',
  styleUrls: ['./calendar-view.scss']
})
export class CalendarViewComponent implements OnInit {
  theme = inject(ThemeService);
  scheduleService = inject(ScheduleService);
  roomService = inject(RoomService);
  userService = inject(UserService);
  patientService = inject(PatientService);
  surgeryTypeService = inject(SurgeryTypeService);
  surgeryService = inject(SurgeryService);

  currentDate = new Date();
  today = new Date();
  selectedSurgery: Surgery | null = null;
  draggedSurgery: Surgery | null = null;
  dragOverCell: string | null = null;
  isGenerating = false;
  generateError = '';

  orRooms: ORRoom[] = [];
  surgeries: Surgery[] = [];

  // ── Add Surgery Modal ────────────────────────────────────────────────────────
  showAddModal = signal(false);
  isSaving = signal(false);
  saveError = signal('');
  patients = signal<any[]>([]);
  surgeons = signal<UserResponse[]>([]);
  rooms = signal<OperatingRoom[]>([]);
  surgeryTypes = signal<SurgeryTypeResponse[]>([]);

  newSurgery = signal<SurgeryRequest>({
    patientId: '',
    surgeonId: '',
    roomId: '',
    surgeryTypeId: '',
    scheduledStart: '',
    scheduledEnd: '',
    priority: 'ELECTIVE',
    notes: ''
  });

  timeSlots: string[] = [
    '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00'
  ];

  ngOnInit(): void {
    this.loadRooms();
    this.loadSchedule();
    this.loadModalData();
  }

  // Expose a grid-template string so the template can create one fixed left column
  // for time labels and one column per OR room. This ensures hours are the first
  // column and each room has its own column after that.
  get gridTemplateColumns(): string {
    // first column fixed for time labels (64px), then one column per room
    const roomCols = this.orRooms && this.orRooms.length ? this.orRooms.map(() => 'minmax(160px, 1fr)').join(' ') : '';
    return `64px ${roomCols}`.trim();
  }

  loadModalData(): void {
    this.patientService.getAllPatients().subscribe(data => this.patients.set(data));
    this.userService.getAll(UserRole.SURGEON).subscribe(data => this.surgeons.set(data));
    this.roomService.getAll().subscribe(data => this.rooms.set(data));
    this.surgeryTypeService.getAll().subscribe(data => this.surgeryTypes.set(data));
  }

  loadRooms(): void {
    this.roomService.getAll().subscribe({
      next: (rooms) => {
        this.orRooms = rooms.map(r => ({
          id: r.id,
          name: r.name,
          utilizationPercent: 0
        }));
        this.updateUtilization();
      },
      error: (err) => console.error('Failed to load rooms', err)
    });
  }

  loadSchedule(): void {
    const start = new Date(this.currentDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(this.currentDate);
    end.setHours(23, 59, 59, 999);

    const startStr = this.formatLocalISO(start);
    const endStr = this.formatLocalISO(end);

    this.scheduleService.getSchedule(startStr, endStr).subscribe({
      next: (data: any[]) => {
        this.surgeries = data.map(item => ({
          id: item.id,
          patientId: item.patientName || 'Unknown Patient',
          surgeonName: item.surgeonName || 'Unknown Surgeon',
          surgeonInitials: this.getInitials(item.surgeonName || 'US'),
          type: item.surgeryTypeName || 'Procedure',
          orRoom: item.roomName || 'OR 1',
          startTime: this.formatTime(item.scheduledStart),
          endTime: this.formatTime(item.scheduledEnd),
          durationMin: this.diffInMinutes(item.scheduledStart, item.scheduledEnd),
          status: item.status?.toLowerCase() as any || 'scheduled',
          color: this.getColorForStatus(item.status)
        }));
        this.updateUtilization();
      },
      error: (err) => console.error('Failed to load schedule', err)
    });
  }

  private updateUtilization(): void {
    const WORKING_MINUTES = 12 * 60; // 07:00 – 19:00
    this.orRooms = this.orRooms.map(room => {
      const totalMin = this.surgeries
        .filter(s => s.orRoom === room.name)
        .reduce((sum, s) => sum + (s.durationMin || 0), 0);
      return { ...room, utilizationPercent: Math.min(100, Math.round((totalMin / WORKING_MINUTES) * 100)) };
    });
  }

  openAddModal(): void {
    const start = new Date(this.currentDate);
    start.setHours(8, 0, 0, 0);
    const end = new Date(this.currentDate);
    end.setHours(9, 0, 0, 0);

    this.newSurgery.set({
      patientId: '',
      surgeonId: '',
      roomId: '',
      surgeryTypeId: '',
      scheduledStart: this.formatLocalISO(start),
      scheduledEnd: this.formatLocalISO(end),
      priority: 'ELECTIVE',
      notes: ''
    });
    this.saveError.set('');
    this.isSaving.set(false);
    this.showAddModal.set(true);
  }

  saveSurgery(): void {
    const s = this.newSurgery();
    this.saveError.set('');

    if (!s.patientId) { this.saveError.set('Please select a patient.'); return; }
    if (!s.surgeonId) { this.saveError.set('Please select a surgeon.'); return; }
    if (!s.roomId) { this.saveError.set('Please select a room.'); return; }
    if (!s.surgeryTypeId) { this.saveError.set('Please select a surgery type.'); return; }
    if (!s.scheduledStart || !s.scheduledEnd) { this.saveError.set('Please set start and end times.'); return; }

    // datetime-local gives "yyyy-MM-ddTHH:mm" (no seconds); backend needs "yyyy-MM-ddTHH:mm:ss"
    const request = {
      ...s,
      scheduledStart: s.scheduledStart.length === 16 ? s.scheduledStart + ':00' : s.scheduledStart,
      scheduledEnd:   s.scheduledEnd.length === 16   ? s.scheduledEnd   + ':00' : s.scheduledEnd,
    };

    this.isSaving.set(true);
    this.surgeryService.create(request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showAddModal.set(false);
        this.loadSchedule();
        this.scheduleService.emitScheduleUpdate();
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = err?.error?.message || err?.error || err?.message || 'Failed to save surgery. Please try again.';
        this.saveError.set(typeof msg === 'string' ? msg : JSON.stringify(msg));
        console.error('Failed to create surgery', err);
      }
    });
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.saveError.set('');
    this.isSaving.set(false);
  }

  updateSurgeryField(field: keyof SurgeryRequest, value: any): void {
    this.newSurgery.update(current => ({ ...current, [field]: value }));
  }

  generateSchedule(): void {
    if (this.isGenerating) return;
    this.isGenerating = true;

    const startDate = this.formatDateOnly(this.currentDate);
    const endDate = this.formatDateOnly(this.currentDate); // Generam doar pentru ziua curenta implicit

    this.generateError = '';
    this.scheduleService.generateSchedule(startDate, endDate).subscribe({
      next: () => {
        this.loadSchedule();
        this.scheduleService.emitScheduleUpdate();
        this.isGenerating = false;
      },
      error: (err) => {
        this.isGenerating = false;
        this.generateError = err?.error?.message || err?.message || 'Auto-schedule failed. Check if the algorithm service is running.';
        console.error('Auto-schedule error:', err);
      }
    });
  }

  formatLocalISO(d: Date): string {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return d.getFullYear() + '-' +
           pad(d.getMonth() + 1) + '-' +
           pad(d.getDate()) + 'T' +
           pad(d.getHours()) + ':' +
           pad(d.getMinutes()) + ':' +
           pad(d.getSeconds());
  }

  formatDateOnly(d: Date): string {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '00:00';
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  diffInMinutes(start: string, end: string): number {
    if (!start || !end) return 60;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return Math.max(15, (e - s) / 60000);
  }

  getColorForStatus(status: string): string {
    if (!status) return 'blue';
    switch(status.toUpperCase()) {
      case 'SCHEDULED': return 'blue';
      case 'IN_PROGRESS': return 'green';
      case 'EMERGENCY': return 'amber';
      case 'STERILIZATION': return 'orange';
      default: return 'blue';
    }
  }

  get formattedDate(): string {
    return this.currentDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  previousDay(): void {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() - 1);
    this.currentDate = d;
    this.loadSchedule();
  }

  nextDay(): void {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + 1);
    this.currentDate = d;
    this.loadSchedule();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.loadSchedule();
  }

  get isToday(): boolean {
    const t = new Date();
    return this.currentDate.toDateString() === t.toDateString();
  }

  get formattedShortDate(): string {
    return this.currentDate.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });
  }


  getSurgeriesForSlot(orRoom: string, time: string): Surgery[] {
    // Extragem doar ora (ex: "08" din "08:00") pentru a permite afișarea operațiilor
    // care încep la minute intermediare (ex: 08:30) în slotul orei respective.
    const [slotHour] = time.split(':');

    return this.surgeries.filter(s => {
      if (!s.startTime) return false;
      const [surgeryHour] = s.startTime.split(':');

      return s.orRoom === orRoom && surgeryHour === slotHour;
    });
  }

  getCardHeight(surgery: Surgery): number {
    return Math.max((surgery.durationMin / 60) * 64, 64);
  }

  openModal(surgery: Surgery): void {
    this.selectedSurgery = surgery;
  }

  closeModal(): void {
    this.selectedSurgery = null;
  }

  onDragStart(surgery: Surgery): void {
    this.draggedSurgery = surgery;
  }

  onDragEnd(): void {
    this.draggedSurgery = null;
    this.dragOverCell = null;
  }

  onDrop(orRoom: string, time: string): void {
    this.dragOverCell = null;
    if (!this.draggedSurgery) return;

    const surgery = this.draggedSurgery;
    const durationMin = surgery.durationMin || 60;

    const [hourStr, minStr] = time.split(':');
    const startDate = new Date(this.currentDate);
    startDate.setHours(Number(hourStr), Number(minStr), 0, 0);
    const endDate = new Date(startDate.getTime() + durationMin * 60000);

    // Immediate visual feedback — mutate in place so change detection picks it up
    surgery.orRoom = orRoom;
    surgery.startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    surgery.endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    // Force array reference change so Angular re-evaluates getSurgeriesForSlot
    this.surgeries = [...this.surgeries];

    const roomId = this.orRooms.find(r => r.name === orRoom)?.id;
    this.surgeryService.reschedule(surgery.id, this.formatLocalISO(startDate), this.formatLocalISO(endDate), roomId).subscribe({
      next: () => {
        this.loadSchedule();
        this.scheduleService.emitScheduleUpdate();
      },
      error: (err) => {
        console.error('Failed to reschedule surgery:', err);
        this.loadSchedule();
      }
    });

    this.draggedSurgery = null;
  }

  onDragOver(event: DragEvent, room?: string, time?: string): void {
    event.preventDefault();
    if (this.draggedSurgery && room != null && time != null) {
      this.dragOverCell = room + time;
    }
  }

  getUtilizationColor(percent?: number): string {
    if (!percent) return '#f87171';
    if (percent >= 80) return '#4ade80';
    if (percent >= 50) return '#facc15';
    return '#f87171';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'scheduled': 'Scheduled',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'emergency': 'Emergency',
      'sterilization': 'Sterilization Pending'
    };
    return map[status.toLowerCase()] || status;
  }
}
