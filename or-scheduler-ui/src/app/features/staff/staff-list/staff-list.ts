import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Staff } from '../models/staff';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-list.html',
  styleUrl: './staff-list.scss'
})
export class StaffList implements OnInit {
  isDarkMode: boolean = true;
  activeFilter: string = 'All';
  searchQuery: string = '';
  filters = ['All', 'Surgeons', 'Nurses', 'On Duty', 'On Leave'];
  days = ['M', 'T', 'W', 'T', 'F'];
  showModal = false;
  newStaff: Partial<Staff> = this.emptyStaff();

  ngOnInit() {
    document.body.classList.remove('light-mode');
    document.documentElement.classList.remove('light-mode');
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('light-mode', !this.isDarkMode);
    document.documentElement.classList.toggle('light-mode', !this.isDarkMode);
  }

  emptyStaff(): Partial<Staff> {
    return {
      name: '', role: 'Surgeon', specialty: '',
      department: '', status: 'On Duty',
      color: '#4f8ef7', surgeriesOrRoom: '',
      nextSurgeryOrShift: '', weekDays: [false, false, false, false, false]
    };
  }

  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; this.newStaff = this.emptyStaff(); }

  addStaff() {
    if (!this.newStaff.name) return;
    const initials = this.newStaff.name.split(' ')
      .map(w => w[0]).join('').substring(0, 2).toUpperCase();
    this.staffList.push({
      id: this.staffList.length + 1,
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
    });
    this.closeModal();
  }

  staffList: Staff[] = [
    { id: 1, name: 'Dr. Ionescu Alexandru', role: 'Surgeon', specialty: 'Cardiac',
      department: 'Cardiology', status: 'On Duty', initials: 'IA', color: '#4CAF50',
      surgeriesOrRoom: '2', nextSurgeryOrShift: '14:00 · Room 1',
      weekDays: [true, true, true, true, true] },
    { id: 2, name: 'Dr. Popescu Maria', role: 'Surgeon', specialty: 'Neurology',
      department: 'Neurology', status: 'On Duty', initials: 'PM', color: '#9C27B0',
      surgeriesOrRoom: '1', nextSurgeryOrShift: '09:00 · Room 3',
      weekDays: [true, false, true, true, false] },
    { id: 3, name: 'Dr. Dumitru Constantin', role: 'Surgeon', specialty: 'Orthopedic',
      department: 'Orthopedics', status: 'On Leave', initials: 'DC', color: '#FF9800',
      surgeriesOrRoom: 'Apr 28', nextSurgeryOrShift: 'Medical',
      weekDays: [false, false, false, false, false] },
    { id: 4, name: 'Ionescu Elena', role: 'Nurse', specialty: '',
      department: 'Cardiology', status: 'On Duty', initials: 'IE', color: '#4CAF50',
      surgeriesOrRoom: 'Room 1', nextSurgeryOrShift: '07:00 – 19:00',
      weekDays: [true, true, true, false, true] },
    { id: 5, name: 'Mihai Radu', role: 'Nurse', specialty: '',
      department: 'Neurology', status: 'On Duty', initials: 'MR', color: '#2196F3',
      surgeriesOrRoom: 'Room 3', nextSurgeryOrShift: '07:00 – 19:00',
      weekDays: [true, true, false, true, true] },
    { id: 6, name: 'Georgescu Ana', role: 'Nurse', specialty: '',
      department: 'Pediatrics', status: 'Off Duty', initials: 'GA', color: '#F44336',
      surgeriesOrRoom: 'Thu 07:00', nextSurgeryOrShift: '19:00 – 07:00',
      weekDays: [true, false, false, true, false] },
  ];

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