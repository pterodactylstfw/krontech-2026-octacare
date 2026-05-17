import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, tap, catchError } from 'rxjs';
import { Surgery } from '../../shared/models/surgery.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private http = inject(HttpClient);
  private apiUrl: string;
  // Subject to notify interested components that the schedule has changed
  private scheduleUpdated = new Subject<void>();
  // Public observable consumers can subscribe to
  readonly scheduleUpdated$ = this.scheduleUpdated.asObservable();

  constructor() {
    this.apiUrl = environment.apiUrl ? environment.apiUrl.replace('/api', '') + '/api/schedule' : '/api/schedule';
  }

  generateSchedule(startDate: string, endDate: string): Observable<any> {
    let params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.post<any>(`${this.apiUrl}/generate`, null, { params }).pipe(
      tap((data: any) => console.log('✅ ScheduleService.generateSchedule() received:', data)),
      catchError((err: any) => {
        console.error('❌ ScheduleService.generateSchedule() error:', err);
        throw err;
      })
    );
  }

  // Emit a schedule-updated event (used after operations like reschedule/create/delete)
  emitScheduleUpdate(): void {
    this.scheduleUpdated.next();
  }

  getSchedule(start: string, end: string): Observable<Surgery[]> {
    let params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<Surgery[]>(this.apiUrl, { params }).pipe(
      tap((data: Surgery[]) => console.log('✅ ScheduleService.getSchedule() received:', data)),
      catchError((err: any) => {
        console.error('❌ ScheduleService.getSchedule() error:', err);
        throw err;
      })
    );
  }
}
