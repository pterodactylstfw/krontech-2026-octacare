import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  newPassword = '';
  confirmPassword = '';
  token = '';
  isLoading = false;
  submitted = false;
  errorMessage = '';
  showPassword = false;
  showConfirm = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMessage = 'Invalid or missing reset token.';
    }
  }

  get passwordsMatch(): boolean {
    return this.newPassword === this.confirmPassword;
  }

  onSubmit() {
  if (!this.newPassword || !this.confirmPassword) return;
  if (!this.passwordsMatch) {
    this.errorMessage = 'Passwords do not match.';
    return;
  }
  if (this.newPassword.length < 6) {
    this.errorMessage = 'Password must be at least 6 characters.';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  this.http.post('http://localhost:8080/api/auth/reset-password', {
    token: this.token,
    newPassword: this.newPassword
  }, { responseType: 'text' }).subscribe({
    next: () => {
      this.isLoading = false;
      this.submitted = true;
    },
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = 'Reset link is invalid or expired.';
    }
  });
}

  backToLogin() {
    this.router.navigate(['/auth/login']);
  }
}