import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Surgery, ORRoom } from '../models/surgery.model';
import { ThemeService } from '../../../core/theme/theme.service';
import { ScheduleService } from '../../../core/services/schedule.service';


@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-view.html',
styleUrls: ['./calendar-view.scss']
})
export class CalendarViewComponent implements OnInit {
  theme = inject(ThemeService);
  scheduleService = inject(ScheduleService);

  currentDate = new Date();
  today = new Date();
  selectedSurgery: Surgery | null = null;
  draggedSurgery: Surgery | null = null;
  isGenerating = false;

  orRooms: ORRoom[] = [
    { id: 'or1', name: 'OR 1', utilizationPercent: 75 },
    { id: 'or2', name: 'OR 2', utilizationPercent: 96 },
    { id: 'or3', name: 'OR 3', utilizationPercent: 60 },
    { id: 'or4', name: 'OR 4', utilizationPercent: 23 },
  ];

  timeSlots: string[] = [
    '07:00','08:00','09:00','10:00','11:00',
    '12:00','13:00','14:00','15:00','16:00',
    '17:00','18:00','19:00'
  ];

  surgeries: Surgery[] = [];

  ngOnInit(): void {
    this.loadSchedule();
  }

  loadSchedule(): void {
    // Luam inceputul si sfarsitul saptamanii/zilei curente (hardcoded temporar pt demo)
    const start = '2026-05-10T00:00:00';
    const end = '2026-05-17T23:59:59';
    
    this.scheduleService.getSchedule(start, end).subscribe({
      next: (data: any[]) => {
        this.surgeries = data.map(item => ({
          id: item.id,
          patientId: item.patientName || 'Unknown Patient',
          surgeonName: item.surgeonName || 'Unknown Surgeon',
          surgeonInitials: this.getInitials(item.surgeonName || 'US'),
          type: item.surgeryTypeName || 'Procedure',
          orRoom: item.roomName as any || 'OR 1',
          startTime: this.formatTime(item.scheduledStart),
          endTime: this.formatTime(item.scheduledEnd),
          durationMin: this.diffInMinutes(item.scheduledStart, item.scheduledEnd),
          status: item.status.toLowerCase() as any,
          color: this.getColorForStatus(item.status)
        }));
      },
      error: (err) => console.error('Failed to load schedule', err)
    });
  }

  generateSchedule(): void {
    if (this.isGenerating) return;
    this.isGenerating = true;
    
    const startDate = '2026-05-10'; // Start date pentru algoritm
    const endDate = '2026-05-17';
    
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
    switch(status) {
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
  }

  nextDay(): void {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + 1);
    this.currentDate = d;
  }

  getSurgeriesForSlot(orRoom: string, time: string): Surgery[] {
    return this.surgeries.filter(s => s.orRoom === orRoom && s.startTime === time);
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
    this.draggedSurgery.orRoom = orRoom as Surgery['orRoom'];
    this.draggedSurgery.startTime = time;
    this.draggedSurgery = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  getUtilizationColor(percent: number): string {
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
    return map[status] || status;
  }
}