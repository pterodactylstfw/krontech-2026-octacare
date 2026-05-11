import { Injectable, inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../../shared/models/user.model';
import { UserRole } from '../enums/user-role.enum';
import { authConfig } from '../config/auth.config';
import { environment } from '../../../environments/environment';

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
        this.handleUnauthorized();
      }
    });

    this.oauthService.setupAutomaticSilentRefresh();

    // Încărcăm documentul și încercăm logarea
    this.oauthService.loadDiscoveryDocumentAndTryLogin()
      .then(() => {
        if (this.oauthService.hasValidAccessToken()) {
          this.loadUserProfile();
        } else {
          // Dacă nu avem token, anunțăm restul aplicației
          this.currentUserSubject.next(null);
        }
      })
      .catch(err => {
        console.error('❌ Nu s-a putut încărca documentul de discovery (Backend offline?):', err);
        this.currentUserSubject.next(null);
      });
  }

  /**
   * RESETARE COMPLETĂ A SESIUNII (NUCLEAR OPTION)
   */
  private handleUnauthorized() {
    console.warn('🔄 Sesiune invalidă detectată. Se execută resetare forțată...');
    
    // 1. Curățăm starea locală a aplicației
    this.currentUserSubject.next(null);
    
    // 2. Curățăm tot storage-ul pentru a elimina token-urile expirate/invalide
    localStorage.clear();
    sessionStorage.clear();
    
    // 3. Forțăm redirecționarea la login
    // Încercăm prin librărie, dar dacă backend-ul a dat 401, probabil librăria e blocată
    try {
      this.oauthService.logOut();
      // Verificăm dacă suntem deja pe login pentru a evita loop-ul
      if (!window.location.pathname.includes('/auth/login')) {
         this.initiateLoginFlow();
      } else {
         // Dacă suntem deja pe login și e blocat, dăm un refresh dur la pagină
         window.location.reload();
      }
    } catch (e) {
      // Fallback extrem: mergem direct la URL-ul de login
      window.location.href = window.location.origin + '/auth/login';
    }
  }

  /**
   * DECLANȘEAZĂ FLOW-UL DE LOGIN CĂTRE SPRING
   */
  public initiateLoginFlow() {
    console.log('🚀 Initiating OIDC Code Flow...');
    this.oauthService.initCodeFlow();
  }

   private loadUserProfile() {
     console.log('📥 Fetching user profile from /api/auth/me...');
     const authUrl = environment.apiUrl ? environment.apiUrl.replace('/api', '') + '/api/auth/me' : '/api/auth/me';

     this.http.get<any>(authUrl).subscribe({
       next: (resp) => {
         console.log('✅ User profile received:', resp);
         if (resp && resp.email) {
           const user: User = {
             id: resp.id,
             email: resp.email,
             fullName: resp.fullName || resp.email,
             role: resp.role as UserRole,
             specialization: resp.specialization,
             phone: resp.phone,
             department: resp.department
           };
           this.currentUserSubject.next(user);
           return;
         }
         this.currentUserSubject.next(null);
       },
       error: (err) => {
         console.error('❌ Failed to load /api/auth/me:', err);
         if (err.status === 401) {
            this.handleUnauthorized();
         } else {
            this.currentUserSubject.next(null);
         }
       }
     });
   }

  public logout(): void {
    console.log('🚪 Logging out...');
    this.currentUserSubject.next(null);
    
    // NOTĂ: Nu ștergem localStorage/sessionStorage manual înainte de logOut().
    // Librăria oauthService.logOut() are nevoie de id_token din storage 
    // pentru a-l trimite ca 'id_token_hint' către backend (OIDC standard).
    // Ea se va ocupa singură de curățarea token-urilor după ce inițiază redirect-ul.
    this.oauthService.logOut();
  }

  public getToken(): string {
    return this.oauthService.getAccessToken();
  }

  public isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  getCurrentUserRole(): UserRole | null {
    return this.currentUserSubject.value?.role || null;
  }
  isAdmin(): boolean { return this.getCurrentUserRole() === UserRole.ADMIN; }
  isSurgeon(): boolean { return this.getCurrentUserRole() === UserRole.SURGEON; }
  isNurse(): boolean { return this.getCurrentUserRole() === UserRole.NURSE; }
  isPatient(): boolean { return this.getCurrentUserRole() === UserRole.PATIENT; }
}
