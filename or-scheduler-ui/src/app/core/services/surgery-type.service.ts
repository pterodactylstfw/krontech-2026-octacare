import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SurgeryTypeResponse {
  id: string;
  name: string;
  category: string;
  avgDurationMinutes: number;
  complexityLevel: number;
}

@Injectable({
  providedIn: 'root'
})
export class SurgeryTypeService {
  private http = inject(HttpClient);
  private apiUrl: string;

  constructor() {
    this.apiUrl = environment.apiUrl ? environment.apiUrl.replace('/api', '') + '/api/surgery-types' : '/api/surgery-types';
  }

  getAll(): Observable<SurgeryTypeResponse[]> {
    return this.http.get<SurgeryTypeResponse[]>(this.apiUrl).pipe(
      tap(data => console.log('✅ SurgeryTypeService.getAll() received:', data)),
      catchError(err => {
        console.error('❌ SurgeryTypeService.getAll() error:', err);
        throw err;
      })
    );
  }
}
