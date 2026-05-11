import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs';
import { Surgery, SurgeryRequest, SurgeryRescheduleRequest } from '../../shared/models/surgery.model';
import { SurgeryStatus } from '../enums/surgery-status.enum';
import { SurgeryPriority } from '../enums/surgery-priority.enum';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SurgeryService {
  private http = inject(HttpClient);
  private apiUrl: string;

  constructor() {
    // Use environment apiUrl if available, otherwise fallback to default
    this.apiUrl = environment.apiUrl ? environment.apiUrl.replace('/api', '') + '/api/surgeries' : '/api/surgeries';
  }

  getAll(status?: SurgeryStatus | string, priority?: SurgeryPriority | string): Observable<Surgery[]> {
    console.log('🔧 SurgeryService.getAll() called with status:', status, 'priority:', priority);
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (priority) {
      params = params.set('priority', priority);
    }
    console.log('🔧 Making HTTP request to:', this.apiUrl, 'with params:', params);
    return this.http.get<Surgery[]>(this.apiUrl, { params }).pipe(
      tap(data => console.log('✅ SurgeryService.getAll() received:', data)),
      catchError(err => {
        console.error('❌ SurgeryService.getAll() error:', err);
        throw err;
      })
    );
  }

  getById(id: string): Observable<Surgery> {
    return this.http.get<Surgery>(`${this.apiUrl}/${id}`);
  }

  getBySurgeon(surgeonId: string): Observable<Surgery[]> {
    return this.http.get<Surgery[]>(`${this.apiUrl}/surgeon/${surgeonId}`);
  }

  getByPatient(patientId: string): Observable<Surgery[]> {
    console.log('🔧 SurgeryService.getByPatient() called with patientId:', patientId);
    const url = `${this.apiUrl}/patient/${patientId}`;
    console.log('🔧 Making HTTP request to:', url);
    return this.http.get<Surgery[]>(url).pipe(
      tap(data => console.log('✅ SurgeryService.getByPatient() received:', data)),
      catchError(err => {
        console.error('❌ SurgeryService.getByPatient() error:', err);
        throw err;
      })
    );
  }

  create(request: SurgeryRequest): Observable<Surgery> {
    return this.http.post<Surgery>(this.apiUrl, request);
  }

  update(id: string, request: SurgeryRequest): Observable<Surgery> {
    return this.http.put<Surgery>(`${this.apiUrl}/${id}`, request);
  }

  updateStatus(id: string, status: SurgeryStatus | string): Observable<Surgery> {
    return this.http.patch<Surgery>(`${this.apiUrl}/${id}/status`, status);
  }

  reschedule(id: string, newStart: string, newEnd: string): Observable<Surgery> {
    const request: SurgeryRescheduleRequest = {
      newStart,
      newEnd
    };
    return this.http.patch<Surgery>(`${this.apiUrl}/${id}/reschedule`, request);
  }
}

