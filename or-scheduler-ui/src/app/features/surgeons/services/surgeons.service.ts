import { Injectable, signal, computed } from '@angular/core';
import { Surgeon, SurgeonStats, SurgeonFilter } from '../models/surgeon.models';

@Injectable({ providedIn: 'root' })
export class SurgeonsService {

  private _surgeons = signal<Surgeon[]>(this.getMockData());
  private _filter = signal<SurgeonFilter>('All');
  private _search = signal<string>('');
  private _departmentFilter = signal<string>('All');

  readonly surgeons = this._surgeons.asReadonly();
  readonly activeFilter = this._filter.asReadonly();
  readonly departmentFilter = this._departmentFilter.asReadonly();

  readonly stats = computed<SurgeonStats>(() => {
    const all = this._surgeons();
    return {
      total: all.length,
      onDuty: all.filter(s => s.status === 'on-duty').length,
      onLeave: all.filter(s => s.status === 'on-leave').length,
      surgeriesToday: all.reduce((sum, s) => sum + s.surgeriesToday, 0),
    };
  });

  readonly filtered = computed<Surgeon[]>(() => {
    const search = this._search().toLowerCase();
    const filter = this._filter();
    const dept = this._departmentFilter();

    return this._surgeons().filter(s => {
      const matchesSearch = !search ||
        s.name.toLowerCase().includes(search) ||
        s.specialty.toLowerCase().includes(search) ||
        s.department.toLowerCase().includes(search);

      const matchesFilter =
        filter === 'All' ? true :
        filter === 'On Duty' ? s.status === 'on-duty' :
        filter === 'On Leave' ? s.status === 'on-leave' :
        s.status === 'off-duty';

      const matchesDept = dept === 'All' || s.department === dept;

      return matchesSearch && matchesFilter && matchesDept;
    });
  });

  setFilter(filter: SurgeonFilter): void {
    this._filter.set(filter);
  }

  setSearch(query: string): void {
    this._search.set(query);
  }

  setDepartment(dept: string): void {
    this._departmentFilter.set(dept);
  }

  addSurgeon(surgeon: Omit<Surgeon, 'id'>): void {
    const newId = Math.max(...this._surgeons().map(s => s.id)) + 1;
    this._surgeons.update(list => [...list, { ...surgeon, id: newId }]);
  }

  updateSurgeon(id: number, updates: Partial<Surgeon>): void {
    this._surgeons.update(list =>
      list.map(s => s.id === id ? { ...s, ...updates } : s)
    );
  }

  deleteSurgeon(id: number): void {
    this._surgeons.update(list => list.filter(s => s.id !== id));
  }

  private getMockData(): Surgeon[] {
    return [
      {
        id: 1,
        initials: 'IA',
        name: 'Dr. Ionescu Alexandru',
        specialty: 'Cardiac',
        department: 'Cardiology',
        status: 'on-duty',
        color: '#1d4ed8',
        surgeriesToday: 3,
        surgeriesWeek: 14,
        successRate: 98.2,
        nextSurgery: '14:00',
        nextRoom: 'Room 1',
        weekDays: [true, true, true, true, true],
        yearsExperience: 18,
        certifications: ['FACS', 'Board Certified'],
      },
      {
        id: 2,
        initials: 'PM',
        name: 'Dr. Popescu Maria',
        specialty: 'Neuro',
        department: 'Neurology',
        status: 'on-duty',
        color: '#7c3aed',
        surgeriesToday: 2,
        surgeriesWeek: 9,
        successRate: 97.5,
        nextSurgery: '09:00',
        nextRoom: 'Room 3',
        weekDays: [true, false, true, true, false],
        yearsExperience: 12,
        certifications: ['FAANS', 'Board Certified'],
      },
      {
        id: 3,
        initials: 'DC',
        name: 'Dr. Dumitru Constantin',
        specialty: 'Orthopedic',
        department: 'Orthopedics',
        status: 'on-leave',
        color: '#d97706',
        surgeriesToday: 0,
        surgeriesWeek: 0,
        successRate: 96.8,
        nextSurgery: undefined,
        nextRoom: undefined,
        weekDays: [false, false, false, false, false],
        yearsExperience: 22,
        certifications: ['FAAOS', 'Board Certified'],
      },
      {
        id: 4,
        initials: 'PS',
        name: 'Dr. Patel Sanjay',
        specialty: 'General',
        department: 'General',
        status: 'on-duty',
        color: '#0d9488',
        surgeriesToday: 2,
        surgeriesWeek: 11,
        successRate: 99.1,
        nextSurgery: '10:00',
        nextRoom: 'Room 2',
        weekDays: [true, true, false, true, true],
        yearsExperience: 9,
        certifications: ['Board Certified'],
      },
      {
        id: 5,
        initials: 'SM',
        name: 'Dr. Smith Michael',
        specialty: 'Cardiac',
        department: 'Cardiology',
        status: 'on-duty',
        color: '#2563eb',
        surgeriesToday: 1,
        surgeriesWeek: 7,
        successRate: 97.9,
        nextSurgery: '11:30',
        nextRoom: 'Room 1',
        weekDays: [true, false, true, false, true],
        yearsExperience: 15,
        certifications: ['FACS', 'Board Certified'],
      },
      {
        id: 6,
        initials: 'LR',
        name: 'Dr. Lungu Raluca',
        specialty: 'Pediatric',
        department: 'Pediatrics',
        status: 'off-duty',
        color: '#db2777',
        surgeriesToday: 0,
        surgeriesWeek: 5,
        successRate: 98.7,
        nextSurgery: undefined,
        nextRoom: undefined,
        weekDays: [false, true, false, true, false],
        yearsExperience: 8,
        certifications: ['Board Certified'],
      },
    ];
  }
}