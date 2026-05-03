import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  // URL-ul Authorization Server-ului nostru (backend-ul de Spring)
  issuer: 'http://localhost:8080',

  // URL-ul din Angular unde va fi redirecționat utilizatorul după login
  redirectUri: window.location.origin + '/auth/callback',

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
