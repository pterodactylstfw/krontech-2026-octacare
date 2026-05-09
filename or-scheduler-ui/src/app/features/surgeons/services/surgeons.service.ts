import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS, API_BASE } from '../../../core/constants/api.constants';
import {
  SurgeonAvailability,
  SurgeonAvailabilityRequest
} from '../models/surgeon.models';

@Injectable({ providedIn: 'root' })
export class SurgeonsService {
  private http = inject(HttpClient);

  getAll(params?: { surgeonId?: string; from?: string; to?: string }): Observable<SurgeonAvailability[]> {
    let httpParams = new HttpParams();
    if (params?.surgeonId) httpParams = httpParams.set('surgeonId', params.surgeonId);
    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);

    return this.http.get<SurgeonAvailability[]>(API_ENDPOINTS.availability, { params: httpParams });
  }

  getBySurgeon(surgeonId: string, params?: { from?: string; to?: string }): Observable<SurgeonAvailability[]> {
    let httpParams = new HttpParams();
    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);

    return this.http.get<SurgeonAvailability[]>(
      `${API_BASE}/surgeons/${surgeonId}/availability`,
      { params: httpParams }
    );
  }

  create(payload: SurgeonAvailabilityRequest): Observable<SurgeonAvailability> {
    return this.http.post<SurgeonAvailability>(API_ENDPOINTS.availability, payload);
  }

  update(id: string, payload: SurgeonAvailabilityRequest): Observable<SurgeonAvailability> {
    return this.http.put<SurgeonAvailability>(`${API_ENDPOINTS.availability}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.availability}/${id}`);
  }
}