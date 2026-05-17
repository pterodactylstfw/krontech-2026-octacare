import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const oauthService = inject(OAuthService);
  const token = oauthService.getAccessToken();
  // On production/AWS, we use relative paths. 
  const isBackendApiRequest = req.url.startsWith('/api') || req.url.startsWith(environment.apiUrl);

  // Trimitem cookies către backend pentru fluxul care se bazează pe access_token HttpOnly
  if (isBackendApiRequest && !req.withCredentials) {
    req = req.clone({ withCredentials: true });
  }

  // Dacă avem și access token în OAuthService, îl trimitem ca Bearer pentru compatibilitate
  if (token && isBackendApiRequest && !req.url.includes('/.well-known/')) {
    console.log('🔐 JWT Interceptor: Adding Authorization header to', req.url);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else if (!token && isBackendApiRequest && !req.url.includes('/.well-known/')) {
    console.warn('⚠️ JWT Interceptor: No token available for', req.url);
  }

  return next(req);
};
