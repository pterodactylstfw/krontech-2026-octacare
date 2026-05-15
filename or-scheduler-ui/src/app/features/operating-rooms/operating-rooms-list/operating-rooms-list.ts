import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperatingRoom, RoomType } from '../../../shared/models/room.model';
import { RoomStatus } from '../../../core/enums/room-status.enum';
import { SurgeryStatus } from '../../../core/enums/surgery-status.enum';
import { ThemeService } from '../../../core/theme/theme.service';
import { SurgeryService } from '../../../core/services/surgery.service';
import { RoomService } from '../../../core/services/room.service';
import { type Surgery } from '../../../shared/models/surgery.model';

type RoomFilter = 'ALL' | RoomStatus;

@Component({
  selector: 'app-operating-rooms-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operating-rooms-list.html',
  styleUrl: './operating-rooms-list.scss'
})
export class OperatingRoomsListComponent implements OnInit {
  theme = inject(ThemeService);
  private surgeryService = inject(SurgeryService);
  private roomService = inject(RoomService);
  readonly RoomStatus = RoomStatus;

  surgeries: Surgery[] = [];
  rooms: OperatingRoom[] = [];
  loading = false;
  error: string | null = null;

  activeFilter: RoomFilter = 'ALL';
  searchQuery = '';
  filters: { label: string; value: RoomFilter }[] = [
    { label: 'All Rooms', value: 'ALL' },
    { label: 'Available', value: RoomStatus.AVAILABLE },
    { label: 'Occupied', value: RoomStatus.OCCUPIED },
    { label: 'Sterilizing', value: RoomStatus.STERILIZING },
    { label: 'Maintenance', value: RoomStatus.MAINTENANCE }
  ];

  showModal = false;
  isEditing = false;
  editingRoomId: string | null = null;
  equipmentText = '';
  roomDraft: Partial<OperatingRoom> = this.emptyRoom();

  readonly roomTypes: { label: string; value: RoomType }[] = [
    { label: 'General', value: 'GENERAL' },
    { label: 'Cardiac', value: 'CARDIAC' },
    { label: 'Neuro', value: 'NEURO' },
    { label: 'Orthopedic', value: 'ORTHOPEDIC' },
    { label: 'Pediatric', value: 'PEDIATRIC' }
  ];

  readonly statusOptions: { label: string; value: RoomStatus }[] = [
    { label: 'Available', value: RoomStatus.AVAILABLE },
    { label: 'Occupied', value: RoomStatus.OCCUPIED },
    { label: 'Sterilizing', value: RoomStatus.STERILIZING },
    { label: 'Maintenance', value: RoomStatus.MAINTENANCE }
  ];

  ngOnInit() {
    this.loadRooms();
    this.loadSurgeries();
  }

  loadRooms() {
    this.loading = true;
    this.roomService.getAll().subscribe({
      next: (data) => {
        this.rooms = (data || []).map(r => ({
          ...r,
          id: r.id || Math.random().toString(36).substring(7),
          name: r.name || `OR ${String(r.id || '').substring(0, 4) || 'New'}`,
          roomType: r.roomType || 'GENERAL',
          status: r.status || RoomStatus.AVAILABLE,
          floor: r.floor || 1,
          equipment: r.equipment || [],
          capacity: r.capacity || 1,
          sterilizationTimeMinutes: r.sterilizationTimeMinutes || 30
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load rooms';
        this.loading = false;
      }
    });
  }

  private loadSurgeries() {
    this.surgeryService.getAll().subscribe({
      next: (data: Surgery[]) => {
        this.surgeries = data;
      },
      error: (err) => {
        this.surgeries = [];
      }
    });
  }

  setFilter(filter: RoomFilter) { this.activeFilter = filter; }

  onSearch(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  get filteredRooms(): OperatingRoom[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.rooms.filter((r) => {
      const matchesFilter = this.activeFilter === 'ALL' || r.status === this.activeFilter;
      const matchesSearch =
        !q ||
        (r.name || '').toLowerCase().includes(q) ||
        (r.roomType || '').toLowerCase().includes(q) ||
        String(r.floor || '').includes(q) ||
        (r.equipment && r.equipment.some((e) => e.toLowerCase().includes(q)));
      return matchesFilter && matchesSearch;
    });
  }

  countByStatus(status: RoomStatus): number {
    return this.rooms.filter((r) => r.status === status).length;
  }

  openAddModal() {
    this.isEditing = false;
    this.editingRoomId = null;
    this.roomDraft = this.emptyRoom();
    this.equipmentText = '';
    this.showModal = true;
  }

  openEditModal(room: OperatingRoom) {
    this.isEditing = true;
    this.editingRoomId = room.id;
    this.roomDraft = { ...room };
    this.equipmentText = (room.equipment || []).join(', ');
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  saveRoom() {
    const name = (this.roomDraft.name || '').trim();
    if (!name) return;

    const parsedEquipment = this.equipmentText
      .split(',').map((s) => s.trim()).filter(Boolean);

    const payload: Partial<OperatingRoom> = {
      name,
      roomType: (this.roomDraft.roomType ?? 'GENERAL') as RoomType,
      status: (this.roomDraft.status ?? RoomStatus.AVAILABLE) as RoomStatus,
      floor: Number(this.roomDraft.floor ?? 1),
      sterilizationTimeMinutes: Number(this.roomDraft.sterilizationTimeMinutes ?? 30),
      equipment: parsedEquipment,
      capacity: Number(this.roomDraft.capacity ?? 1)
    };

    if (this.isEditing && this.editingRoomId) {
      this.roomService.update(this.editingRoomId, payload).subscribe({
        next: () => {
          this.loadRooms();
          this.closeModal();
        },
        error: (err) => this.error = 'Failed to update room'
      });
    } else {
      this.roomService.create(payload).subscribe({
        next: () => {
          this.loadRooms();
          this.closeModal();
        },
        error: (err) => this.error = 'Failed to create room'
      });
    }
  }

  deleteRoom(id: string) {
    if (confirm('Are you sure you want to delete this room?')) {
      this.roomService.delete(id).subscribe({
        next: () => this.loadRooms(),
        error: (err) => this.error = 'Failed to delete room'
      });
    }
  }

  emptyRoom(): Partial<OperatingRoom> {
    return {
      name: '', roomType: 'GENERAL', status: RoomStatus.AVAILABLE,
      floor: 1, sterilizationTimeMinutes: 30, equipment: [], capacity: 5
    };
  }

  roomTypeLabel(type: RoomType): string {
    return this.roomTypes.find((t) => t.value === type)?.label ?? type;
  }

  statusLabel(status: RoomStatus): string {
    return this.statusOptions.find((s) => s.value === status)?.label ?? status;
  }

  statusClass(status: RoomStatus): string {
    switch (status) {
      case RoomStatus.AVAILABLE: return 'green';
      case RoomStatus.OCCUPIED: return 'red';
      case RoomStatus.STERILIZING: return 'yellow';
      case RoomStatus.MAINTENANCE: return 'orange';
      default: return 'muted';
    }
  }

  utilizationPercent(room: OperatingRoom): number {
    const seed = Array.from(room.id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const base = (seed * 37) % 71;
    const statusBoost =
      room.status === RoomStatus.OCCUPIED ? 25 :
        room.status === RoomStatus.STERILIZING ? 10 : 0;
    return Math.max(0, Math.min(100, base + statusBoost));
  }

  getActiveSurgery(roomId: string) {
    const candidates = this.surgeries.filter(
      (s) => s.roomId === roomId &&
        (s.status === SurgeryStatus.IN_PROGRESS || s.status === SurgeryStatus.SCHEDULED)
    );
    const active =
      candidates.find((s) => s.status === SurgeryStatus.IN_PROGRESS) ??
      candidates.sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart))[0];
    if (!active) return null;

    const surgeon = active.surgeonName ?? 'Unknown surgeon';
    const end = new Date(active.scheduledEnd);
    return {
      surgeon,
      endsAt: isNaN(end.getTime()) ? '' : end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      label: active.status === SurgeryStatus.IN_PROGRESS ? 'Current surgery' : 'Next surgery',
      status: active.status
    };
  }
  showTimelineModal = false;
  timelineRoom: OperatingRoom | null = null;

  openTimeline(room: OperatingRoom) {
    this.timelineRoom = room;
    this.showTimelineModal = true;
  }

  closeTimeline() {
    this.showTimelineModal = false;
    this.timelineRoom = null;
  }

  getTimelineSurgeries(roomId: string) {
    const DAY_START = 360;
    const DAY_SPAN = 960;

    const items = this.surgeries
      .filter(s => s.roomId === roomId)
      .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart))
      .map(s => {
        const start = new Date(s.scheduledStart);
        const end = new Date(s.scheduledEnd);
        const surgeon = s.surgeonName ?? 'Unknown';
        const startMin = start.getHours() * 60 + start.getMinutes();
        const endMin = end.getHours() * 60 + end.getMinutes();
        const left = Math.max(0, ((startMin - DAY_START) / DAY_SPAN) * 100);
        const width = Math.min(100 - left, ((endMin - startMin) / DAY_SPAN) * 100);
        return {
          id: s.id, surgeon, status: s.status, startMin, endMin,
          startLabel: isNaN(start.getTime()) ? '' : start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endLabel: isNaN(end.getTime()) ? '' : end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          left, width: Math.max(width, 3), lane: 0
        };
      });

    const laneEnds: number[] = [];
    for (const item of items) {
      const freeLane = laneEnds.findIndex(end => end <= item.startMin);
      if (freeLane === -1) { item.lane = laneEnds.length; laneEnds.push(item.endMin); }
      else { item.lane = freeLane; laneEnds[freeLane] = item.endMin; }
    }

    return { items, totalLanes: Math.max(1, laneEnds.length) };
  }

  timelineHours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

  getNowPercent(): number {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return Math.max(0, Math.min(100, ((nowMin - 360) / 960) * 100));
  }
}
