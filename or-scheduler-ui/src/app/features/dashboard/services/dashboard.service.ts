import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DashboardData } from '../models/dashboard.models';
import { tap, catchError } from 'rxjs';
import {environment} from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl: string;

  private _data = signal<DashboardData | null>(null);
  readonly data = this._data.asReadonly();

  constructor() {
    this.apiUrl = environment.apiUrl ? environment.apiUrl + '/dashboard' : '/api/dashboard';
    this.refreshData();
    // Refresh automat la fiecare 30 de secunde
    setInterval(() => this.refreshData(), 30000);
  }

  refreshData(): void {
    this.http.get<DashboardData>(this.apiUrl).pipe(
      tap(data => this._data.set(data)),
      catchError(err => {
        console.error('❌ Failed to load dashboard data', err);
        throw err;
      })
    ).subscribe();
  }
}
