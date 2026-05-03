import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken(); // Preluăm token-ul activ

  // IMPORTANT: Adăugăm token-ul doar dacă există și cererea nu este pentru discovery document
  if (token && !req.url.includes('/.well-known/openid-configuration')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Format standard OAuth2[cite: 11]
      }
    });
  }

  return next(req);
};
