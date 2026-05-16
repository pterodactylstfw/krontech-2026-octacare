import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ReportsData } from '../models/reports.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl ? environment.apiUrl.replace('/api', '') + '/api/reports' : '/api/reports';

  getReportsData(): Observable<ReportsData> {
    return this.http.get<ReportsData>(this.apiUrl).pipe(
      tap((data) => console.log('✅ ReportsService.getReportsData() response:', data))
    );
  }
}

