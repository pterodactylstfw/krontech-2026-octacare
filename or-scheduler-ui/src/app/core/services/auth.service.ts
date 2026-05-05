import { Injectable, inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../../shared/models/user.model';
import { UserRole } from '../enums/user-role.enum';
import { authConfig } from '../config/auth.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private oauthService = inject(OAuthService);
  private http = inject(HttpClient);

  constructor() {
    this.configureOAuth();
  }

  private configureOAuth() {
    this.oauthService.configure(authConfig);

    // Setează librăria să curețe automat datele vechi de login dacă apare o eroare
    this.oauthService.events.subscribe(event => {
      if (event.type === 'token_validation_error' || event.type === 'invalid_nonce_in_state') {
        console.error('Eroare critică la validarea token-ului:', event);
        // Dacă validarea eșuează, ștergem tot pentru a permite o reîncercare curată
        this.oauthService.logOut();
      }
    });

    this.oauthService.setupAutomaticSilentRefresh();

    // Încărcăm documentul și încercăm logarea
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      if (this.oauthService.hasValidAccessToken()) {
        this.loadUserProfile();
      }
    });
  }

  /**
   * DECLANȘEAZĂ FLOW-UL DE LOGIN CĂTRE SPRING
   */
  public initiateLoginFlow() {
    // Metoda asta va genera code_challenge și va face redirectul la 8080 corect
    this.oauthService.initCodeFlow();
  }

  private loadUserProfile() {
    // Luăm profilul strict din backend (/api/auth/me) – NU folosim fallback pe claims
    // Conform cerinței: folosim DOAR datele expuse de auth controller și ce avem pe branch.
    this.http.get<any>('/api/auth/me', { withCredentials: true }).subscribe({
      next: (resp) => {
        if (resp && resp.email) {
          const user: User = {
            id: resp.id,
            email: resp.email,
            fullName: resp.fullName || resp.email,
            role: resp.role as UserRole
          };
          this.currentUserSubject.next(user);
          return;
        }

        // Dacă răspunsul nu conține email (sau e incomplet), nu facem niciun fallback automat.
        console.warn('/api/auth/me returned unexpected payload, keeping current user null', resp);
        this.currentUserSubject.next(null);
      },
      error: (err) => {
        // Dacă apelul către auth controller eșuează, nu folosim claims – doar curățăm starea.
        console.error('Failed to load /api/auth/me:', err);
        this.currentUserSubject.next(null);
      }
    });
  }

  // NOTE: We intentionally do NOT read roles from identity claims here. All user data
  // must come from the backend auth controller (/api/auth/me) as requested.

  public logout(): void {
    this.currentUserSubject.next(null);

    // Această metodă șterge token-urile locale și FACE REDIRECT automat
    // către http://localhost:8080/connect/logout pentru a ucide cookie-ul.
    // Spring te va trimite înapoi pe portul 4200 (postLogoutRedirectUri) automat!
    this.oauthService.logOut();
  }

  public getToken(): string {
    return this.oauthService.getAccessToken();
  }

  public isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  // --- Metodele de roluri (Păstrate din varianta veche) ---
  getCurrentUserRole(): UserRole | null {
    return this.currentUserSubject.value?.role || null;
  }
  isAdmin(): boolean { return this.getCurrentUserRole() === UserRole.ADMIN; }
  isSurgeon(): boolean { return this.getCurrentUserRole() === UserRole.SURGEON; }
  isNurse(): boolean { return this.getCurrentUserRole() === UserRole.NURSE; }
  isPatient(): boolean { return this.getCurrentUserRole() === UserRole.PATIENT; }
}
