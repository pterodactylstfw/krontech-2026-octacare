import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/theme/theme.service';
import {
    NurseProfile,
    NurseStats,
    NurseTask,
    NurseTaskFilter,
    RoomStatus,
    ShiftPatient,
    EquipmentAlert,
} from './nurse.models';




@Component({
    selector: 'app-nurse-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class NurseDashboardComponent {
    readonly theme = inject(ThemeService);

    readonly today = new Date().toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    readonly taskFilters: NurseTaskFilter[] = ['All', 'Pending', 'Done'];

    // ── State ──────────────────────────────────────────────────────────────────
    nurse = signal<NurseProfile>({
        id: 1,
        initials: 'MA',
        firstName: 'Maria',
        name: 'Nurse Maria Andrei',
        unit: 'Surgical Unit B',
        shift: 'Morning',
    });

    private _activeTaskFilter = signal<NurseTaskFilter>('All');

    private _tasks = signal<NurseTask[]>([
        { id: 1, name: 'Pre-op prep — Popa Ion', room: 'OR 1', time: '09:30', priority: 'high', status: 'done', patient: 'Popa Ion' },
        { id: 2, name: 'Sterilization check — OR 2', room: 'OR 2', time: '10:00', priority: 'high', status: 'pending', patient: null },
        { id: 3, name: 'Medication round — Ward B', room: 'Ward B', time: '10:30', priority: 'medium', status: 'pending', patient: null },
        { id: 4, name: 'Post-op monitoring — Gheorghe M.', room: 'Recovery', time: '11:00', priority: 'high', status: 'pending', patient: 'Gheorghe Mihai' },
        { id: 5, name: 'Equipment calibration — OR 3', room: 'OR 3', time: '11:30', priority: 'medium', status: 'pending', patient: null },
        { id: 6, name: 'Patient intake — Dumitru E.', room: 'Ward B', time: '13:00', priority: 'low', status: 'pending', patient: 'Dumitru Elena' },
        { id: 7, name: 'Linen change — OR 1', room: 'OR 1', time: '13:30', priority: 'low', status: 'done', patient: null },
    ]);

    private _rooms = signal<RoomStatus[]>([
        { id: 1, name: 'OR 1', specialty: 'Cardiac', floor: 'Floor 2', utilization: 75, status: 'active', statusLabel: 'Active' },
        { id: 2, name: 'OR 2', specialty: 'General', floor: 'Floor 2', utilization: 96, status: 'active', statusLabel: 'Active' },
        { id: 3, name: 'OR 3', specialty: 'Neuro', floor: 'Floor 3', utilization: 60, status: 'sterilizing', statusLabel: 'Sterilizing' },
        { id: 4, name: 'OR 4', specialty: 'Orthopedic', floor: 'Floor 1', utilization: 23, status: 'available', statusLabel: 'Available' },
    ]);

    private _shiftPatients = signal<ShiftPatient[]>([
        { id: 1, initials: 'PI', name: 'Popa Ion', room: 'OR 1', procedure: 'Coronary Bypass', status: 'in-or', statusLabel: 'In OR', time: '10:30' },
        { id: 2, initials: 'GM', name: 'Gheorghe Mihai', room: 'Recovery', procedure: 'Appendectomy', status: 'recovery', statusLabel: 'Recovery', time: '09:15' },
        { id: 3, initials: 'DE', name: 'Dumitru Elena', room: 'Ward B', procedure: 'Valve Repair', status: 'pre-op', statusLabel: 'Pre-Op', time: '13:00' },
        { id: 4, initials: 'NR', name: 'Nicolae Radu', room: 'Ward B', procedure: 'Knee Replacement', status: 'discharge', statusLabel: 'Discharge', time: '15:00' },
    ]);

    private _equipAlerts = signal<EquipmentAlert[]>([
        { id: 1, equipment: 'Defibrillator', description: 'Calibration overdue', room: 'OR 4', severity: 'critical' },
        { id: 2, equipment: 'OR 3 Lights', description: '+15 min behind schedule', room: 'OR 3', severity: 'warning' },
    ]);

    // ── Computed ───────────────────────────────────────────────────────────────
    readonly activeTaskFilter = this._activeTaskFilter.asReadonly();
    readonly operatingRooms = this._rooms.asReadonly();
    readonly shiftPatients = this._shiftPatients.asReadonly();
    readonly equipmentAlerts = this._equipAlerts.asReadonly();

    readonly filteredTasks = computed<NurseTask[]>(() => {
        const filter = this._activeTaskFilter();
        const tasks = this._tasks();
        if (filter === 'Pending') return tasks.filter(t => t.status === 'pending');
        if (filter === 'Done') return tasks.filter(t => t.status === 'done');
        return tasks;
    });

    readonly taskProgress = computed(() => {
        const tasks = this._tasks();
        if (tasks.length === 0) return 0;
        return Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100);
    });

    readonly pendingTasksCount = computed(() =>
        this._tasks().filter(t => t.status === 'pending').length
    );

    readonly nurseStats = computed<NurseStats>(() => {
        const tasks = this._tasks();
        const rooms = this._rooms();
        return {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'done').length,
            patientsCount: this._shiftPatients().length,
            roomsReady: rooms.filter(r => r.status === 'available').length,
            roomsTotal: rooms.length,
            equipmentAlerts: this._equipAlerts().length,
        };
    });

    // ── Methods ────────────────────────────────────────────────────────────────
    setTaskFilter(filter: NurseTaskFilter): void {
        this._activeTaskFilter.set(filter);
    }

    toggleTask(id: number): void {
        this._tasks.update(list =>
            list.map(t => t.id === id
                ? { ...t, status: t.status === 'done' ? 'pending' : 'done' }
                : t
            )
        );
    }

    resolveEquipAlert(id: number): void {
        this._equipAlerts.update(list => list.filter(e => e.id !== id));
    }

    getRoomFillClass(utilization: number): string {
        if (utilization >= 85) return 'fill-high';
        if (utilization >= 50) return 'fill-medium';
        return 'fill-low';
    }

}
