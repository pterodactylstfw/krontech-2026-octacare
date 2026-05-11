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
  isGenerating = false;

  orRooms: ORRoom[] = [];
  surgeries: Surgery[] = [];

  // ── Add Surgery Modal ────────────────────────────────────────────────────────
  showAddModal = signal(false);
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

  loadModalData(): void {
    this.patientService.getAllPatients().subscribe(data => this.patients.set(data));
    this.userService.getAll(UserRole.SURGEON).subscribe(data => this.surgeons.set(data));
    this.roomService.getAll().subscribe(data => this.rooms.set(data));
    this.surgeryTypeService.getAll().subscribe(data => this.surgeryTypes.set(data));
  }

  ngOnInit(): void { }
  loadRooms(): void {
    this.roomService.getAll().subscribe({
      next: (rooms) => {
        this.orRooms = rooms.map(r => ({
          id: r.id,
          name: r.name,
          utilizationPercent: Math.floor(Math.random() * 100)
        }));
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
      },
      error: (err) => console.error('Failed to load schedule', err)
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
    this.showAddModal.set(true);
  }

  saveSurgery(): void {
    const s = this.newSurgery();
    if (!s.patientId || !s.surgeonId || !s.surgeryTypeId) return;

    this.surgeryService.create(s).subscribe({
      next: () => {
        this.showAddModal.set(false);
        this.loadSchedule();
      },
      error: (err) => console.error('Failed to create surgery', err)
    });
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  updateSurgeryField(field: keyof SurgeryRequest, value: any): void {
    this.newSurgery.update(current => ({ ...current, [field]: value }));
  }

  generateSchedule(): void {
    if (this.isGenerating) return;
    this.isGenerating = true;

    const startDate = this.formatDateOnly(this.currentDate);
    const endDate = this.formatDateOnly(this.currentDate); // Generam doar pentru ziua curenta implicit

    this.scheduleService.generateSchedule(startDate, endDate).subscribe({
      next: () => {
        this.loadSchedule();
        this.isGenerating = false;
      },
      error: () => {
        this.isGenerating = false;
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

  goToToday(): void {
    this.currentDate = new Date();
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

  onDrop(orRoom: string, time: string): void {
    if (!this.draggedSurgery) return;
    this.draggedSurgery.orRoom = orRoom;
    this.draggedSurgery.startTime = time;
    this.draggedSurgery = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
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