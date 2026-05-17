import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  // URL-ul Authorization Server-ului nostru
  // Folosim origin-ul curent (ex: http://IP:4200) pentru că Nginx va face proxy
  issuer: window.location.origin,

  // Dezactivăm validarea strictă pentru a permite login-ul pe IP-uri diferite/porturi diferite (Docker vs AWS)
  strictDiscoveryDocumentValidation: false,
  skipIssuerCheck: true,

  // URL-ul din Angular unde va fi redirecționat utilizatorul după login
  redirectUri: window.location.origin + '/auth/callback',

  postLogoutRedirectUri: window.location.origin + '/auth/login',

  // Client ID-ul configurat în AuthorizationServerConfig
  clientId: 'or-scheduler-ui',

  // Tipul de răspuns așteptat (codul necesar pentru PKCE)
  responseType: 'code',

  // Scope-urile configurate în Spring
  scope: 'openid profile role',

  // Afișează debug info în consolă (opțional, dar util)
  showDebugInformation: true,

  requireHttps: false
};
