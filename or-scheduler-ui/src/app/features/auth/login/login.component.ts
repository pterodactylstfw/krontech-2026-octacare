import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  showDemoLogin = !environment.production;

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (!response) {
          this.errorMessage = 'Incorrect email or password.';
          return;
        }
        this.navigateByRole(this.authService.getCurrentUserRole());
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred. Please try again.';
      }
    });
  }

  onDemoLogin() {
    const demoUser = this.authService.demoLogin();
    this.navigateByRole(demoUser.role);
  }

  private navigateByRole(role: UserRole | null) {
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
  }
}
