import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { SurgeonAvailabilityService } from './services/surgeon-availability.service';
import { UserService, UserRole, UserResponse } from '../../core/services/user.service';
import {
  AvailabilityReason,
  SurgeonAvailability,
  SurgeonAvailabilityRequest
} from './models/surgeon.models';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-surgeons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './surgeons.component.html',
  styleUrl: './surgeons.component.scss'
})
export class SurgeonsComponent {
  private svc = inject(SurgeonAvailabilityService);
  private userService = inject(UserService);
  readonly theme = inject(ThemeService);
  availability = signal<SurgeonAvailability[]>([]);
  surgeons = signal<UserResponse[]>([]);
  search = signal('');
  from = signal('');
  to = signal('');
  selectedSurgeonId = signal('');

  loading = signal(false);
  error = signal<string | null>(null);

  showModal = signal(false);
  editingId = signal<string | null>(null);

  form = signal<SurgeonAvailabilityRequest>({
    surgeonId: '',
    date: '',
    startTime: '',
    endTime: '',
    isAvailable: true,
    reason: null
  });

  readonly stats = computed(() => {
    const all = this.availability();
    const unique = new Set(all.map(item => item.surgeonId));
    const available = all.filter(item => item.isAvailable).length;
    return {
      totalEntries: all.length,
      available,
      unavailable: all.length - available,
      uniqueSurgeons: unique.size
    };
  });

  readonly surgeonOptions = computed(() => {
    return this.surgeons().map(s => ({ id: s.id, name: s.fullName }));
  });

  readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    const selectedId = this.selectedSurgeonId();

    return this.availability().filter((item: SurgeonAvailability) => {
      const matchesSearch = !query || item.surgeonName.toLowerCase().includes(query);
      const matchesSurgeon = !selectedId || item.surgeonId === selectedId;
      return matchesSearch && matchesSurgeon;
    });
  });

  constructor() {
    this.loadSurgeons();
    this.loadAvailability();
  }

  loadSurgeons(): void {
    this.userService.getAll(UserRole.SURGEON).subscribe({
      next: (data) => this.surgeons.set(data),
      error: (err) => console.error('Failed to load surgeons', err)
    });
  }

  loadAvailability(): void {
    this.loading.set(true);
    this.error.set(null);

    const params = this.buildQueryParams();
    this.svc.getAll(params).subscribe({
      next: (data: SurgeonAvailability[]) => {
        this.availability.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err?.error?.message || err?.message || 'Nu am putut incarca disponibilitatea.');
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.loadAvailability();
  }

  resetFilters(): void {
    this.search.set('');
    this.from.set('');
    this.to.set('');
    this.selectedSurgeonId.set('');
    this.loadAvailability();
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  openAddModal(): void {
    this.editingId.set(null);
    this.form.set({
      surgeonId: this.selectedSurgeonId() || '',
      date: '',
      startTime: '',
      endTime: '',
      isAvailable: true,
      reason: null
    });
    this.showModal.set(true);
  }

  openEditModal(item: SurgeonAvailability): void {
    this.editingId.set(item.id);
    this.form.set({
      surgeonId: item.surgeonId,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      isAvailable: item.isAvailable,
      reason: item.reason
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  saveAvailability(): void {
    const payload = this.normalizePayload(this.form());
    if (!payload.surgeonId || !payload.date || !payload.startTime || !payload.endTime) return;

    const request = this.editingId()
      ? this.svc.update(this.editingId() as string, payload)
      : this.svc.create(payload);

    request.subscribe({
      next: () => {
        this.closeModal();
        this.loadAvailability();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err?.error?.message || err?.message || 'Operatia a esuat.');
      }
    });
  }

  deleteAvailability(id: string): void {
    this.svc.delete(id).subscribe({
      next: () => this.loadAvailability(),
      error: (err: HttpErrorResponse) => {
        this.error.set(err?.error?.message || err?.message || 'Stergerea a esuat.');
      }
    });
  }

  updateField(field: keyof SurgeonAvailabilityRequest, value: string | boolean | AvailabilityReason): void {
    this.form.update((current: SurgeonAvailabilityRequest) => ({ ...current, [field]: value }));
  }

  getAvailabilityLabel(isAvailable: boolean): string {
    return isAvailable ? 'Available' : 'Unavailable';
  }

  private buildQueryParams(): { surgeonId?: string; from?: string; to?: string } {
    const params: { surgeonId?: string; from?: string; to?: string } = {};
    if (this.selectedSurgeonId()) params.surgeonId = this.selectedSurgeonId();
    if (this.from()) params.from = this.from();
    if (this.to()) params.to = this.to();
    return params;
  }

  private normalizePayload(payload: SurgeonAvailabilityRequest): SurgeonAvailabilityRequest {
    if (payload.isAvailable) {
      return { ...payload, reason: null };
    }
    return payload;
  }
}