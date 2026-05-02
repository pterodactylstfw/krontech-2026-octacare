import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';
import { UserRole } from '../enums/user-role.enum';
import { environment } from '../../../environments/environment';
import { MOCK_USERS } from '../mock/mock-data';
import { API_ENDPOINTS } from '../constants/api.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private readonly redirectUri = 'http://localhost:4200/auth/callback';
  private readonly clientId = 'or-scheduler-ui';

  constructor(private http: HttpClient, private router: Router) {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUserSubject.next(JSON.parse(saved));
    }
  }

  /**
   * Login:
   * - folosește mocks când environment.useMocks === true
   * - altfel apelează backend-ul la API_ENDPOINTS.auth/login cu withCredentials
   * Răspunsul backend poate avea diferite forme; încercăm să extragem user-ul și token-ul dacă există.
   */
  login(email: string, password: string): Observable<any> {
    if (environment.useMocks) {
      const user = MOCK_USERS.find(u => u.email === email);
      if (user) {
        this.setSession('mock-jwt-token', user);
        return of({ token: 'mock-jwt-token', user });
      }
      return of(null);
    }

    // Request către backend; withCredentials: true pentru cookie HttpOnly (session/refresh cookie)
    return this.http.post<any>(`${API_ENDPOINTS.auth}/login`, { email, password }, { withCredentials: true }).pipe(
      map(response => {
        // Normalize response: user poate veni sub property 'user' sau numai 'email'
        const userFromResponse: User | undefined = response?.user
          ? response.user
          : response?.email
            ? { id: response?.id ?? '', email: response.email, fullName: response?.fullName ?? response.email, role: response?.role ?? null, department: response?.department ?? '' } as User
            : undefined;

        const tokenFromResponse: string | undefined = response?.token;

        return { raw: response, user: userFromResponse, token: tokenFromResponse };
      }),
      tap(({ user, token }) => {
        // Dacă server nu returnează user (dar a creat sesiune cookie), putem apela un endpoint /api/auth/me separat.
        // Ca fallback, dacă nu avem user în răspuns, nu setăm session local (poți decide altfel).
        if (user) {
          // dacă token nu este trimis (cookie session), folosim token gol sau null
          this.setSession(token ?? '', user);
        }
      })
    );
  }

  exchangeCodeForToken(code: string): Observable<any> {
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', this.redirectUri) // Obligatoriu sƒ fie /auth/callback
      .set('client_id', 'or-scheduler-ui')
      .set('client_secret', 'secret');

    return this.http.post('http://localhost:8080/oauth2/token', body.toString(), {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      withCredentials: true // Pentru a primi cookie-ul securizat[cite: 1]
    });
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

  private setSession(token: string | null, user: User): void {
    // token poate fi gol când server folosește cookie HttpOnly
    if (token !== null && token !== undefined && token !== '') {
      localStorage.setItem('token', token);
    } else {
      // opțional: eliminăm token stocat anterior
      localStorage.removeItem('token');
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    // Dacă backend gestionează sesiunea, ideal e să apelăm /api/auth/logout cu withCredentials;
    // in acest exemplu păstrăm comportamentul local + recomandare de apel backend.
    // Exemplu (opțional):
    // this.http.post(`${API_ENDPOINTS.auth}/logout`, {}, { withCredentials: true }).subscribe();

    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken() || !!this.getCurrentUser();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserRole(): UserRole | null {
    return (this.currentUserSubject.value?.role ?? null) as UserRole | null;
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
