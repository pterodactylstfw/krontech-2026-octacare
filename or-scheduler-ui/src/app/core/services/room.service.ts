import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export type { OperatingRoom } from '../../shared/models/room.model';
import type { OperatingRoom } from '../../shared/models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl: string;

  constructor() {
    this.apiUrl = environment.apiUrl ? environment.apiUrl.replace('/api', '') + '/api/rooms' : '/api/rooms';
  }

  getAll(): Observable<OperatingRoom[]> {
    return this.http.get<OperatingRoom[]>(this.apiUrl).pipe(
      tap(data => console.log('✅ RoomService.getAll() received:', data)),
      catchError(err => {
        console.error('❌ RoomService.getAll() error:', err);
        throw err;
      })
    );
  }

  create(room: Partial<OperatingRoom>): Observable<OperatingRoom> {
    return this.http.post<OperatingRoom>(this.apiUrl, room);
  }

  update(id: string, room: Partial<OperatingRoom>): Observable<OperatingRoom> {
    return this.http.put<OperatingRoom>(`${this.apiUrl}/${id}`, room);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
