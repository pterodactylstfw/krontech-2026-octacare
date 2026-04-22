import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/enums/user-role.enum';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Completați toate câmpurile.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (!response) {
          this.errorMessage = 'Email sau parolă incorectă.';
          return;
        }
        // redirect în funcție de rol
        const role = this.authService.getCurrentUserRole();
        switch (role) {
          case UserRole.ADMIN:
          case UserRole.SURGEON:
          case UserRole.NURSE:
            this.router.navigate(['/dashboard']);
            break;
          case UserRole.PATIENT:
            this.router.navigate(['/patients/portal']);
            break;
          default:
            this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'A apărut o eroare. Încercați din nou.';
      }
    });
  }
}
