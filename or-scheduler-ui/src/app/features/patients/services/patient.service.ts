import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, catchError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

export interface PatientSurgeryView {
  id: string;
  surgeonName: string;
  roomName: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string | any;
  priority: string | any;
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
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  private resolvePatientUser(): any {
    let current: any = null;
    this.authService.currentUser$.subscribe(user => {
      current = user;
    }).unsubscribe();
    return current;
  }

  getMyProfile(): Observable<PatientProfile> {
    const user = this.resolvePatientUser();
    if (!user) return of({
      id: '',
      fullName: 'Unknown',
      email: '',
      phone: '+40 000 000 000'
    });

    const profile: PatientProfile = {
      id: user?.id ?? '',
      fullName: user?.fullName ?? 'Unknown',
      email: user?.email ?? '',
      phone: user?.phone ?? '+40 000 000 000',
      bloodType: 'Unknown',
      allergies: [],
      emergencyContact: 'Not provided'
    };
    return of(profile);
  }

   getMySurgeries(): Observable<PatientSurgeryView[]> {
     const user = this.resolvePatientUser();
     if (!user?.id) {
       console.warn('PatientService: No patient user found');
       return of([]);
     }

     console.log('🔧 PatientService.getMySurgeries() - calling /api/surgeries/my');
     // Call the new /my endpoint that handles current user context
     // environment.apiUrl is /api, so we append surgeries/my to it
     const apiUrl = `${environment.apiUrl}/surgeries/my`;

     // The jwtInterceptor will automatically add the Authorization header with the bearer token
     return this.http.get<any[]>(apiUrl).pipe(
       switchMap((surgeries: any[]) => {
         console.log('✅ PatientService.getMySurgeries() received:', surgeries);
         const views: PatientSurgeryView[] = surgeries.map((s: any) => ({
           id: s.id,
           surgeonName: s.surgeonName ?? 'Unknown',
           roomName: s.roomName ?? 'Unknown',
           scheduledStart: s.scheduledStart,
           scheduledEnd: s.scheduledEnd,
           status: s.status,
           priority: s.priority
         }));
         return of(views);
       }),
       catchError((error) => {
         console.error('❌ PatientService.getMySurgeries() error:', error);
         if (error.status === 401) {
           console.error('❌ Unauthorized - user may not be authenticated properly');
         }
         return of([]);
       })
     );
   }

   getAllPatients(): Observable<any[]> {
     const apiUrl = `${environment.apiUrl}/patients`;
     return this.http.get<any[]>(apiUrl);
   }
}
