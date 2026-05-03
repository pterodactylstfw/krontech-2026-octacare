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
    // 1. Verificăm dacă avem erori de login în URL
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.isLoading = false;
        console.error('Eroare primită de la serverul de identitate:', params['error']);
        return;
      }
    });

    // 2. Monitorizăm utilizatorul
    this.authService.currentUser$.subscribe(user => {
      if (user && user.role) {
        setTimeout(() => this.navigateByRole(user.role), 0);
      } else {
        // 3. Dacă după 3 secunde spinner-ul tot rulează și nu avem user,
        // înseamnă că validarea a eșuat sau s-a blocat.
        setTimeout(() => {
          if (this.isLoading && !this.authService.isLoggedIn()) {
            console.warn('Login timeout - redirecționare forțată către flow-ul de login');
            this.authService.initiateLoginFlow();
          }
        }, 3000);
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
