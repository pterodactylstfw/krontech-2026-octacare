import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoading = true; // Afișăm spinner-ul tău în timp ce au loc redirecționările invizibile

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.role) {
        // Dacă am găsit userul, oprim orice alt proces și plecăm la dashboard-ul lui
        console.log('Navigare către dashboard pentru rolul:', user.role);

        // setTimeout(..., 0) rezolvă conflictele de animație
        setTimeout(() => {
          this.navigateByRole(user.role);
        }, 0);
      } else {
        // Doar dacă NU suntem logați verificăm dacă trebuie să inițiem login-ul
        const hasCode = window.location.href.includes('code=');
        if (!hasCode && !this.authService.isLoggedIn()) {
          this.authService.initiateLoginFlow();
        }
      }
    });
  }

  private navigateByRole(role: string | null) {
    this.isLoading = false;

    // Normalizăm rolul (Spring uneori trimite ROLE_SURGEON, Angular vrea SURGEON)
    const normalizedRole = role?.replace('ROLE_', '') || '';

    switch (normalizedRole) {
      case 'PATIENT':
        this.router.navigate(['/patients/portal']);
        break;
      case 'SURGEON':
        this.router.navigate(['/doctor']); // Verifică dacă ruta e exact 'doctor' în app-routing.module.ts
        break;
      case 'NURSE':
        this.router.navigate(['/nurse']);
        break;
      case 'ADMIN':
        this.router.navigate(['/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }
}
