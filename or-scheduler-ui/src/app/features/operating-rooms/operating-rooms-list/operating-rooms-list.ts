import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperatingRoom, RoomType } from '../../../shared/models/room.model';
import { RoomStatus } from '../../../core/enums/room-status.enum';
import { MOCK_ROOMS, MOCK_SURGERIES, MOCK_USERS } from '../../../core/mock/mock-data';
import { SurgeryStatus } from '../../../core/enums/surgery-status.enum';
import { ThemeService } from '../../../core/theme/theme.service';

type RoomFilter = 'ALL' | RoomStatus;

@Component({
  selector: 'app-operating-rooms-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operating-rooms-list.html',
  styleUrl: './operating-rooms-list.scss'
})
export class OperatingRoomsListComponent {
  theme = inject(ThemeService);
  readonly RoomStatus = RoomStatus;

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
  rooms: OperatingRoom[] = [...MOCK_ROOMS];

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
        r.name.toLowerCase().includes(q) ||
        r.roomType.toLowerCase().includes(q) ||
        String(r.floor).includes(q) ||
        r.equipment.some((e) => e.toLowerCase().includes(q));
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
    this.equipmentText = room.equipment.join(', ');
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  saveRoom() {
    const name = (this.roomDraft.name || '').trim();
    if (!name) return;

    const parsedEquipment = this.equipmentText
      .split(',').map((s) => s.trim()).filter(Boolean);

    const next: OperatingRoom = {
      id: this.isEditing && this.editingRoomId ? this.editingRoomId : this.nextId(),
      name,
      roomType: (this.roomDraft.roomType ?? 'GENERAL') as RoomType,
      status: (this.roomDraft.status ?? RoomStatus.AVAILABLE) as RoomStatus,
      floor: Number(this.roomDraft.floor ?? 1),
      sterilizationTimeMinutes: Number(this.roomDraft.sterilizationTimeMinutes ?? 30),
      equipment: parsedEquipment,
      capacity: Number(this.roomDraft.capacity ?? 5)
    };

    if (this.isEditing && this.editingRoomId) {
      this.rooms = this.rooms.map((r) => (r.id === this.editingRoomId ? next : r));
    } else {
      this.rooms = [next, ...this.rooms];
    }
    this.closeModal();
  }

  private nextId(): string {
    const max = this.rooms.reduce((acc, r) => Math.max(acc, Number(r.id) || 0), 0);
    return String(max + 1);
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
    const candidates = MOCK_SURGERIES.filter(
      (s) => s.roomId === roomId &&
      (s.status === SurgeryStatus.IN_PROGRESS || s.status === SurgeryStatus.SCHEDULED)
    );
    const active =
      candidates.find((s) => s.status === SurgeryStatus.IN_PROGRESS) ??
      candidates.sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart))[0];
    if (!active) return null;

    const surgeon = MOCK_USERS.find((u) => u.id === active.surgeonId)?.fullName ?? 'Unknown surgeon';
    const end = new Date(active.scheduledEnd);
    return {
      surgeon,
      endsAt: isNaN(end.getTime()) ? '' : end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      label: active.status === SurgeryStatus.IN_PROGRESS ? 'Current surgery' : 'Next surgery',
      status: active.status
    };
  }
}