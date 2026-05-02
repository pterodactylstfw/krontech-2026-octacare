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
  scope: 'openid profile',

  // Afișează debug info în consolă (opțional, dar util)
  showDebugInformation: true,

  // Oprește verificarea de discovery document, deoarece vom configura rutele manual
  requireHttps: false,
  skipIssuerCheck: true,
  strictDiscoveryDocumentValidation: false,

  // Setăm manual endpoint-urile, deoarece nu avem un document .well-known/openid-configuration expus corect (încă)
  loginUrl: 'http://localhost:8080/oauth2/authorize',
  tokenEndpoint: 'http://localhost:8080/oauth2/token'
};
