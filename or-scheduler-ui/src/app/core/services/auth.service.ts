import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';
import { UserRole } from '../enums/user-role.enum';
import { environment } from '../../../environments/environment';
import { MOCK_USERS } from '../mock/mock-data';
import { API_ENDPOINTS } from '../constants/api.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUserSubject.next(JSON.parse(saved));
    }
  }

  login(email: string, password: string): Observable<any> {
    if (environment.useMocks) {
      const user = MOCK_USERS.find(u => u.email === email);
      if (user) {
        this.setSession('mock-jwt-token', user);
        return of({ token: 'mock-jwt-token', user });
      }
      return of(null);
    }

    return this.http.post<any>(`${API_ENDPOINTS.auth}/login`, { email, password }).pipe(
      tap(response => {
        this.setSession(response.token, response.user);
      })
    );
  }

  demoLogin(): User {
    const demoUser = MOCK_USERS.find(u => u.role === UserRole.ADMIN) ?? MOCK_USERS[0] ?? {
      id: 'demo-admin',
      email: 'demo@hospital.com',
      fullName: 'Demo Administrator',
      role: UserRole.ADMIN,
      department: 'Management'
    };

    this.setSession('demo-jwt-token', demoUser);
    return demoUser;
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserRole(): UserRole | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  isAdmin(): boolean {
    return this.getCurrentUserRole() === UserRole.ADMIN;
  }

  isSurgeon(): boolean {
    return this.getCurrentUserRole() === UserRole.SURGEON;
  }

  isNurse(): boolean {
    return this.getCurrentUserRole() === UserRole.NURSE;
  }

  isPatient(): boolean {
    return this.getCurrentUserRole() === UserRole.PATIENT;
  }
}
