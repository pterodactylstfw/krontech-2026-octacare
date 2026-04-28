import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { MOCK_SURGERIES, MOCK_USERS, MOCK_ROOMS } from '../../../core/mock/mock-data';
import { Surgery } from '../../../shared/models/surgery.model';
import { environment } from '../../../../environments/environment';

export interface PatientSurgeryView {
  id: string;
  surgeonName: string;
  roomName: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  priority: string;
}

export interface PatientProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: string;
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  constructor(private authService: AuthService) {}

  getMyProfile(): Observable<PatientProfile> {
    const user = this.authService.getCurrentUser();
    const profile: PatientProfile = {
      id: user?.id ?? '',
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '+40 722 123 456',
      bloodType: 'A+',
      allergies: ['Penicillin'],
      emergencyContact: 'Maria Ion — +40 733 456 789'
    };
    return of(profile);
  }

  getMySurgeries(): Observable<PatientSurgeryView[]> {
    const user = this.authService.getCurrentUser();
    if (!user) return of([]);

    const surgeries = MOCK_SURGERIES.filter(s => s.patientId === user.id);
    const views: PatientSurgeryView[] = surgeries.map(s => {
      const surgeon = MOCK_USERS.find(u => u.id === s.surgeonId);
      const room = MOCK_ROOMS.find(r => r.id === s.roomId);
      return {
        id: s.id,
        surgeonName: surgeon?.fullName ?? 'Unknown',
        roomName: room?.name ?? 'Unknown',
        scheduledStart: s.scheduledStart,
        scheduledEnd: s.scheduledEnd,
        status: s.status,
        priority: s.priority
      };
    });
    return of(views);
  }

  getUpcomingSurgeries(): Observable<PatientSurgeryView[]> {
    return new Observable(observer => {
      this.getMySurgeries().subscribe(all => {
        observer.next(all.filter(s => s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS'));
        observer.complete();
      });
    });
  }

  getPastSurgeries(): Observable<PatientSurgeryView[]> {
    return new Observable(observer => {
      this.getMySurgeries().subscribe(all => {
        observer.next(all.filter(s => s.status === 'COMPLETED' || s.status === 'CANCELLED'));
        observer.complete();
      });
    });
  }
}
