import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email = '';
  submitted = false;
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router, private http: HttpClient) {}

  onSubmit() {
    if (!this.email) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.http.post('http://localhost:8080/api/auth/forgot-password', { email: this.email }).subscribe({
      next: () => {
        this.isLoading = false;
        this.submitted = true;
      },
      error: () => {
        this.isLoading = false;
        this.submitted = true; // Nu revelăm dacă emailul există
      }
    });
  }

  backToLogin() {
    this.router.navigate(['/auth/login']);
  }
}