import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurgeonsService } from './services/surgeons.service';
import { Surgeon, SurgeonFilter } from './models/surgeon.models';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-surgeons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './surgeons.component.html',
  styleUrl: './surgeons.component.scss'
})
export class SurgeonsComponent {
  private svc = inject(SurgeonsService);
  readonly theme = inject(ThemeService);

  stats = this.svc.stats;
  filtered = this.svc.filtered;
  activeFilter = this.svc.activeFilter;
  departmentFilter = this.svc.departmentFilter;

  readonly filters: SurgeonFilter[] = ['All', 'On Duty', 'On Leave', 'Off Duty'];
  readonly departments = ['All', 'Cardiology', 'Neurology', 'Orthopedics', 'General', 'Pediatrics'];
  readonly days = ['M', 'T', 'W', 'T', 'F'];

  showModal = signal(false);
  editingSurgeon = signal<Surgeon | null>(null);

  newSurgeon = signal({
    name: '',
    specialty: '',
    department: 'Cardiology',
    status: 'on-duty' as Surgeon['status'],
    color: '#3b7fff',
    yearsExperience: 0,
  });

  setFilter(f: SurgeonFilter): void {
    this.svc.setFilter(f);
  }

  setDepartment(d: string): void {
    this.svc.setDepartment(d);
  }

  onSearch(event: Event): void {
    this.svc.setSearch((event.target as HTMLInputElement).value);
  }

  openAddModal(): void {
    this.editingSurgeon.set(null);
    this.showModal.set(true);
  }

  openEditModal(surgeon: Surgeon): void {
    this.editingSurgeon.set(surgeon);
    this.newSurgeon.set({
      name: surgeon.name,
      specialty: surgeon.specialty,
      department: surgeon.department,
      status: surgeon.status,
      color: surgeon.color,
      yearsExperience: surgeon.yearsExperience,
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingSurgeon.set(null);
    this.resetForm();
  }

  saveSurgeon(): void {
    const form = this.newSurgeon();
    if (!form.name.trim()) return;

    const nameParts = form.name.trim().split(' ');
    const initials = nameParts.length >= 2
      ? (nameParts[nameParts.length - 2][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : form.name.substring(0, 2).toUpperCase();

    const editing = this.editingSurgeon();
    if (editing) {
      this.svc.updateSurgeon(editing.id, { ...form, initials });
    } else {
      this.svc.addSurgeon({
        ...form,
        initials,
        surgeriesToday: 0,
        surgeriesWeek: 0,
        successRate: 0,
        weekDays: [false, false, false, false, false],
        certifications: [],
      });
    }
    this.closeModal();
  }

  deleteSurgeon(id: number): void {
    this.svc.deleteSurgeon(id);
  }

  updateField(field: string, value: string | number): void {
    this.newSurgeon.update(s => ({ ...s, [field]: value }));
  }

  getStatusClass(status: string): string {
    if (status === 'on-duty') return 'badge-duty';
    if (status === 'on-leave') return 'badge-leave';
    return 'badge-off';
  }

  getStatusLabel(status: string): string {
    if (status === 'on-duty') return 'On Duty';
    if (status === 'on-leave') return 'On Leave';
    return 'Off Duty';
  }

  getSuccessColor(rate: number): string {
    if (rate >= 98) return 'rate-excellent';
    if (rate >= 95) return 'rate-good';
    return 'rate-avg';
  }

  private resetForm(): void {
    this.newSurgeon.set({
      name: '', specialty: '', department: 'Cardiology',
      status: 'on-duty', color: '#3b7fff', yearsExperience: 0,
    });
  }
}