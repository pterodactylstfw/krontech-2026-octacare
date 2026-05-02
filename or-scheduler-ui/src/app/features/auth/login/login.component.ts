import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'; // Adăugat HttpClient
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/enums/user-role.enum';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // Deoarece login-ul se face pe Spring (8080), aceste câmpuri pot rămâne goale aici
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  showDemoLogin = !environment.production;


  private readonly tokenUrl = 'http://localhost:8080/oauth2/token';
  private readonly clientId = 'or-scheduler-ui';
  private readonly redirectUri = 'http://localhost:4200/auth/callback';
  private isProcessingCode = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient // Injectăm HttpClient pentru a repara eroarea de la exchangeCode
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      // Procesăm doar dacă avem cod și nu suntem deja în curs de procesare
      if (code && !this.isProcessingCode) {
        this.isProcessingCode = true;
        this.handleAuthenticationCallback(code);
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    this.isLoading = true;
    // Folosește variabila redirectUri pentru a evita greșelile de scriere
    const authUrl = `http://localhost:8080/oauth2/authorize?response_type=code&client_id=${this.clientId}&scope=openid%20profile&redirect_uri=${encodeURIComponent(this.redirectUri)}`;

    window.location.href = authUrl;
  }

  onDemoLogin() {
    const demoUser = this.authService.demoLogin();
    this.navigateByRole(demoUser.role);
  }

  private handleAuthenticationCallback(code: string) {
    this.isLoading = true;
    // Ne asigurăm că apelăm serviciul care are configurația corectă
    this.authService.exchangeCodeForToken(code).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to exchange code for token.';
        console.error('Detalii eroare 400:', err);
      }
    });
  }



  getCurrentUserRole(): UserRole | null {
    // În fluxul cu cookie-uri, aici ar trebui să ceri user-ul de la un endpoint /api/user/me
    // Pentru moment folosim implementarea din serviciu sau fallback la ADMIN
    return this.authService.getCurrentUserRole() || UserRole.ADMIN;
  }

  private navigateByRole(role: UserRole | null) {
    if (role === UserRole.PATIENT) {
      this.router.navigate(['/patients/portal']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
