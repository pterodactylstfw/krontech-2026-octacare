package octacare.orschedulercore.dto.auth;

/**
 * Request pentru schimbul authorization code pe access token (PKCE flow).
 * Clientul Angular trimite:
 * 1. authorization code primit la callback
 * 2. code_verifier (pereche PKCE cu challenge-ul trimis la authorize)
 * 3. redirect_uri (trebuie să matche cu cel din register)
 */
public record AuthExchangeCodeRequest(
    String code,
    String codeVerifier,
    String redirectUri
) { }

