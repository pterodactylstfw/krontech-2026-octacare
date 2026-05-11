import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export enum UserRole {
  ADMIN = 'ADMIN',
  SURGEON = 'SURGEON',
  NURSE = 'NURSE',
  PATIENT = 'PATIENT'
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  specialization?: string;
  phone?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserUpsertRequest {
  email: string;
  fullName: string;
  password?: string;
  role: UserRole;
  specialization?: string;
  phone?: string;
  department?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl: string;

  constructor() {
    this.apiUrl = environment.apiUrl ? environment.apiUrl.replace('/api', '') + '/api/users' : '/api/users';
  }

  getAll(role?: string, department?: string): Observable<UserResponse[]> {
    let params = new HttpParams();
    if (role) params = params.set('role', role);
    if (department) params = params.set('department', department);

    return this.http.get<UserResponse[]>(this.apiUrl, { params }).pipe(
      tap(data => console.log('✅ UserService.getAll() received:', data)),
      catchError(err => {
        console.error('❌ UserService.getAll() error:', err);
        throw err;
      })
    );
  }

  getById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  getMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/me`);
  }

  create(request: UserUpsertRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl, request);
  }

  update(id: string, request: UserUpsertRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  patch(id: string, request: any): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}`, request);
  }
}
