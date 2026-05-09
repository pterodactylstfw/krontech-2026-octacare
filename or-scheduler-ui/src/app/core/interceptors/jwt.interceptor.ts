import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const oauthService = inject(OAuthService);
  const token = oauthService.getAccessToken();

  // IMPORTANT: Add token to request if available and not for discovery endpoint
  if (token && !req.url.includes('/.well-known/openid-configuration')) {
    console.log('🔐 JWT Interceptor: Adding Authorization header to', req.url);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else if (!token) {
    console.warn('⚠️ JWT Interceptor: No token available for', req.url);
  } else if (req.url.includes('/.well-known/openid-configuration')) {
    console.log('ℹ️ JWT Interceptor: Skipping token for discovery document');
  }

  return next(req);
};
