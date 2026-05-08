import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Surgery, ORRoom } from '../models/surgery.model';
import { ThemeService } from '../../../core/theme/theme.service';


@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-view.html',
  styleUrls: ['./calendar-view.scss']
})
export class CalendarViewComponent implements OnInit {
  theme = inject(ThemeService);

  currentDate = new Date();
  today = new Date();
  selectedSurgery: Surgery | null = null;
  draggedSurgery: Surgery | null = null;

  orRooms: ORRoom[] = [
    { id: 'or1', name: 'OR 1', utilizationPercent: 75 },
    { id: 'or2', name: 'OR 2', utilizationPercent: 96 },
    { id: 'or3', name: 'OR 3', utilizationPercent: 60 },
    { id: 'or4', name: 'OR 4', utilizationPercent: 23 },
  ];

  timeSlots: string[] = [
    '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00'
  ];

  surgeries: Surgery[] = [
    {
      id: 's1', patientId: 'Patient ID1', surgeonName: 'Dr. Smith',
      surgeonInitials: 'DS', type: 'Appendectomy', orRoom: 'OR 1',
      startTime: '08:00', endTime: '09:30', durationMin: 90,
      status: 'scheduled', color: 'blue'
    },
    {
      id: 's2', patientId: 'Patient ID1', surgeonName: 'Dr. Patel',
      surgeonInitials: 'DP', type: 'Knee Replacement', orRoom: 'OR 2',
      startTime: '08:00', endTime: '09:30', durationMin: 90,
      status: 'scheduled', color: 'green'
    },
    {
      id: 's3', patientId: 'Patient ID1', surgeonName: 'Dr. Patel',
      surgeonInitials: 'DP', type: 'Knee Replacement', orRoom: 'OR 3',
      startTime: '08:00', endTime: '09:30', durationMin: 90,
      status: 'scheduled', color: 'green'
    },
    {
      id: 's4', patientId: 'Patient ID3', surgeonName: 'Dr. Smith',
      surgeonInitials: 'DS', type: 'Appendectomy', orRoom: 'OR 1',
      startTime: '10:00', endTime: '11:30', durationMin: 90,
      status: 'in-progress', color: 'blue'
    },
    {
      id: 's5', patientId: 'Patient ID5', surgeonName: 'Dr. Ionescu',
      surgeonInitials: 'DI', type: 'Heart Bypass', orRoom: 'OR 4',
      startTime: '10:00', endTime: '11:30', durationMin: 90,
      status: 'emergency', color: 'amber'
    },
    {
      id: 's6', patientId: 'Patient ID5', surgeonName: 'Dr. Smith',
      surgeonInitials: 'DS', type: 'Appendectomy', orRoom: 'OR 1',
      startTime: '14:00', endTime: '15:30', durationMin: 90,
      status: 'scheduled', color: 'blue'
    },
    {
      id: 's7', patientId: 'Patient D3', surgeonName: 'Dr. Patel',
      surgeonInitials: 'DP', type: 'Knee Replacement', orRoom: 'OR 3',
      startTime: '14:00', endTime: '15:00', durationMin: 60,
      status: 'sterilization', color: 'orange'
    },
    {
      id: 's8', patientId: 'Patient ID7', surgeonName: 'Dr. Ionescu',
      surgeonInitials: 'DI', type: 'Heart Bypass', orRoom: 'OR 2',
      startTime: '15:00', endTime: '16:30', durationMin: 90,
      status: 'sterilization', color: 'orange'
    },
    {
      id: 's9', patientId: 'Patient ID8', surgeonName: 'Dr. Ionescu',
      surgeonInitials: 'DI', type: 'Heart Bypass', orRoom: 'OR 4',
      startTime: '16:00', endTime: '17:30', durationMin: 90,
      status: 'emergency', color: 'amber'
    },
  ];

  ngOnInit(): void { }

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