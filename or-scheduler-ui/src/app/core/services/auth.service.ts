import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { UserRole } from '../enums/user-role.enum';
import { authConfig } from '../config/auth.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private oauthService = inject(OAuthService);
  private router = inject(Router);

  constructor() {
    this.configureOAuth();
  }

  private configureOAuth() {
    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();

    // Aici e magia "ca la carte": descarcă harta mai întâi, Apoi încearcă logarea
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      if (this.oauthService.hasValidAccessToken()) {
        this.loadUserProfile();
      }
    }).catch(err => {
      console.error('Eroare la Discovery Document sau Logare:', err);
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
    // În mod ideal, Spring ar trebui să expună un endpoint /userinfo
    // pe care să-l apelăm cu this.oauthService.loadUserProfile()
    // Pentru moment, vom extrage datele direct din JWT (dacă există)
    const claims: any = this.oauthService.getIdentityClaims();
    if (claims) {
      const user: User = {
        id: claims.sub,
        email: claims.sub,
        fullName: claims.name || claims.sub,
        role: this.extractRoleFromClaims(claims)
      };
      this.currentUserSubject.next(user);
    }
  }

  private extractRoleFromClaims(claims: any): UserRole {
    // Căutăm în noul câmp 'user_roles' creat în backend
    const roles = claims['user_roles'] || claims['roles'] || [];

    if (Array.isArray(roles)) {
      // Luăm primul rol care începe cu ROLE_ (ex: ROLE_SURGEON)
      const actualRole = roles.find(r => r.startsWith('ROLE_'));
      if (actualRole) {
        return actualRole.replace('ROLE_', '') as UserRole;
      }
    }

    // Dacă tot nu găsim nimic, returnăm un fallback, dar logăm claims pentru debug
    console.warn('Rol real negăsit în claims:', claims);
    return UserRole.ADMIN;
  }

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
