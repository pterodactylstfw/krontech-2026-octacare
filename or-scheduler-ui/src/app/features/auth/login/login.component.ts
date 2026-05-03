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
    this.route.queryParams.subscribe(params => {
      // 1. Dacă avem 'code' în URL, ne-am întors de la Spring cu succes.
      if (params['code']) {
        // Nu facem nimic manual! angular-oauth2-oidc schimbă automat codul în fundal.
        // Noi doar ne abonăm și așteptăm să apară userul ca să știm unde să-l trimitem.
        this.authService.currentUser$.subscribe(user => {
          if (user) {
            this.navigateByRole(user.role);
          }
        });
      }
      // 2. Dacă suntem deja logați (avem token valid în browser)
      else if (this.authService.isLoggedIn()) {
        this.navigateByRole(this.authService.getCurrentUserRole());
      }
      // 3. Nu avem cod, nu suntem logați -> Declanșăm logarea sigură (PKCE)
      else {
        this.authService.initiateLoginFlow();
      }
    });
  }

  private navigateByRole(role: string | null) {
    if (role === 'PATIENT') {
      this.router.navigate(['/patients/portal']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
