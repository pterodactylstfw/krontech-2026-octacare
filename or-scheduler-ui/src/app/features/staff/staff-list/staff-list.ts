import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Staff } from '../models/staff';
import { ThemeService } from '../../../core/theme/theme.service';
import { UserService, UserRole } from '../../../core/services/user.service';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-list.html',
  styleUrl: './staff-list.scss'
})
export class StaffList implements OnInit {
  theme = inject(ThemeService);
  userService = inject(UserService);

  activeFilter: string = 'All';
  searchQuery: string = '';
  filters = ['All', 'Surgeons', 'Nurses', 'On Duty', 'On Leave'];
  days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  daysShort = ['M', 'T', 'W', 'T', 'F'];

  staffList: Staff[] = [];
  loading = false;

  // ── Add modal ────────────────────────────────────────────────────────────────
  showModal = false;
  newStaff: Partial<Staff> = this.emptyStaff();

  // ── Edit modal ───────────────────────────────────────────────────────────────
  showEditModal = false;
  editStaff: Partial<Staff> = {};
  editingId: string | null = null;

  // ── View Schedule modal ──────────────────────────────────────────────────────
  showScheduleModal = false;
  scheduleStaff: Staff | null = null;

  ngOnInit() {
    this.loadStaff();
  }

  loadStaff() {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (users) => {
        this.staffList = users
          .filter(u => u.role === UserRole.SURGEON || u.role === UserRole.NURSE)
          .map(u => ({
            id: u.id,
            name: u.fullName,
            role: u.role === UserRole.SURGEON ? 'Surgeon' : 'Nurse',
            specialty: u.specialization || '',
            department: u.department || '',
            status: 'On Duty', // Mock status
            initials: this.getInitials(u.fullName),
            color: this.getRandomColor(),
            surgeriesOrRoom: '',
            nextSurgeryOrShift: '',
            weekDays: [true, true, true, true, true] // Default full availability
          }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load staff', err);
        this.loading = false;
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ')
      .map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  getRandomColor(): string {
    const colors = ['#4CAF50', '#9C27B0', '#FF9800', '#2196F3', '#F44336', '#3F51B5'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  emptyStaff(): Partial<Staff> {
    return {
      name: '', role: 'Surgeon', specialty: '',
      department: '', status: 'On Duty',
      color: '#4f8ef7', surgeriesOrRoom: '',
      nextSurgeryOrShift: '', weekDays: [false, false, false, false, false]
    };
  }

  // ── Add ──────────────────────────────────────────────────────────────────────
  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; this.newStaff = this.emptyStaff(); }

  addStaff() {
    if (!this.newStaff.name) return;

    // In a real scenario, we would call userService.create here
    // For now, we update local list to show UI feedback
    const initials = this.getInitials(this.newStaff.name!);

    const newEntry: Staff = {
      id: crypto.randomUUID(),
      name: this.newStaff.name!,
      role: this.newStaff.role as 'Surgeon' | 'Nurse',
      specialty: this.newStaff.specialty || '',
      department: this.newStaff.department || '',
      status: this.newStaff.status as 'On Duty' | 'On Leave' | 'Off Duty',
      initials,
      color: this.newStaff.color || '#4f8ef7',
      surgeriesOrRoom: '',
      nextSurgeryOrShift: '',
      weekDays: [false, false, false, false, false]
    };

    this.staffList.push(newEntry);
    this.closeModal();
  }

  // ── Edit ─────────────────────────────────────────────────────────────────────
  openEditModal(staff: Staff) {
    this.editStaff = { ...staff, weekDays: [...staff.weekDays] };
    this.editingId = staff.id;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editStaff = {};
    this.editingId = null;
  }

  saveEdit() {
    if (!this.editStaff.name) return;
    const idx = this.staffList.findIndex(s => s.id === this.editingId);
    if (idx === -1) return;

    const initials = this.getInitials(this.editStaff.name!);

    this.staffList[idx] = {
      ...this.staffList[idx],
      ...this.editStaff,
      initials
    } as Staff;

    this.closeEditModal();
  }

  // ── View Schedule ─────────────────────────────────────────────────────────────
  openSchedule(staff: Staff) {
    this.scheduleStaff = staff;
    this.showScheduleModal = true;
  }

  getActiveDaysCount(): number {
    return this.scheduleStaff?.weekDays.filter(d => d).length ?? 0;
  }

  closeSchedule() {
    this.showScheduleModal = false;
    this.scheduleStaff = null;
  }

  getWeekSchedule(staff: Staff): { day: string; active: boolean; detail: string }[] {
    return this.days.map((day, i) => ({
      day,
      active: staff.weekDays[i],
      detail: staff.weekDays[i]
        ? (staff.role === 'Surgeon'
            ? `Surgery · ${staff.nextSurgeryOrShift || 'TBD'}`
            : `Shift · ${staff.nextSurgeryOrShift || 'TBD'}`)
        : 'Day off'
    }));
  }

  get filteredStaff(): Staff[] {
    return this.staffList.filter(s => {
      const matchesFilter =
        this.activeFilter === 'All' ||
        (this.activeFilter === 'Surgeons' && s.role === 'Surgeon') ||
        (this.activeFilter === 'Nurses' && s.role === 'Nurse') ||
        (this.activeFilter === 'On Duty' && s.status === 'On Duty') ||
        (this.activeFilter === 'On Leave' && s.status === 'On Leave');
      const matchesSearch = s.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }

  setFilter(filter: string) { this.activeFilter = filter; }
  onSearch(event: Event) { this.searchQuery = (event.target as HTMLInputElement).value; }
  countByStatus(status: string): number { return this.staffList.filter(s => s.status === status).length; }
  get filteredOnDuty(): number { return this.staffList.filter(s => s.status === 'On Duty').length; }
}