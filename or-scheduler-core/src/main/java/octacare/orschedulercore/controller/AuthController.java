package octacare.orschedulercore.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import octacare.orschedulercore.dto.ErrorResponse;
import octacare.orschedulercore.dto.auth.AuthExchangeCodeRequest;
import octacare.orschedulercore.dto.auth.CurrentUserResponse;
import octacare.orschedulercore.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Cookie;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import octacare.orschedulercore.config.AuthProperties;
import octacare.orschedulercore.service.AuditService;

/**
 * AuthController gestionează:
 * 1. Obținerea utilizatorului curent autentificat
 * 2. Logout (ștergerea tokenului din cookie)
 * 3. Exchange code endpoint (pentru varianta API pură, dacă nu se folosește OAuth2)
 *
 * Fluxul recomandat:
 * - Angular-oauth2-oidc face authorization code flow automat
 * - tokenul va fi trimis în Authorization header
 * - controllerul trebuie doar să returneze user info după validarea tokenului
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints pentru autentificare și profil utilizator")
public class AuthController {

    private final AuthService authService;
    private final JwtDecoder jwtDecoder;
    private final WebClient webClient;
    private final AuthProperties authProperties;
    private final AuditService auditService;

    private final Logger log = LoggerFactory.getLogger(AuthController.class);

    public AuthController(AuthService authService, JwtDecoder jwtDecoder, WebClient webClient, AuthProperties authProperties, AuditService auditService) {
        this.authService = authService;
        this.jwtDecoder = jwtDecoder;
        this.webClient = webClient;
        this.authProperties = authProperties;
        this.auditService = auditService;
    }

    /**
     * GET /api/auth/me
     * Returnează profilul utilizatorului autentificat curent.
     * Useful pentru:
     * - Verificare la încărcare pagină (check dacă user este logat)
     * - Populare header/meniu cu info utilizator
     * - Validare rol după login
     */
    @GetMapping("/me")
    @Operation(summary = "Obține utilizatorul curent autentificat",
               description = "Returnează datele utilizatorului din JWT claims și baza de date")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User info returnate cu succes",
                     content = @Content(mediaType = "application/json", schema = @Schema(implementation = CurrentUserResponse.class))),
        @ApiResponse(responseCode = "401", description = "Utilizatorul nu este autentificat"),
        @ApiResponse(responseCode = "500", description = "Eroare server")
    })
    public ResponseEntity<CurrentUserResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        try {
            CurrentUserResponse user = authService.getCurrentUser();
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * POST /api/auth/logout
     * Logout endpoint.
     * Frontend-ul va apela asta și va curăța sesiunea locală.
     * Backend-ul ștergere cookie-ul access token și refresh token (dacă exista).
     */
    @PostMapping("/logout")
    @Operation(summary = "Logout utilizator",
               description = "Ștergerea sesiunii și cookie-urilor de autentificare")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logout cu succes"),
        @ApiResponse(responseCode = "401", description = "Utilizatorul nu era autentificat")
    })
    public ResponseEntity<?> logout() {
        // Ștergem cookie-urile cu token
        org.springframework.http.HttpHeaders headers = new HttpHeaders();
        headers.add("Set-Cookie", "access_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax");
        headers.add("Set-Cookie", "refresh_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax");

        return ResponseEntity.ok()
                .headers(headers)
                .body("Logged out successfully");
    }

    /**
     * POST /api/auth/exchange-code
     * Endpoint pentru exchange authorization code cu access token (PKCE flow).
     *
     * NOTĂ:
     * - Spring Authorization Server-ul deja gestionează /oauth2/token
     * - Angular-oauth2-oidc poate apela direct /oauth2/token
     * - Acest endpoint este opțional și pentru o abordare mai custom unde
     *   vrem ca front-end-ul să nu vorbească direct cu /oauth2/token (mai sigur)
     *
     * Cerere:
     * {
     *   "code": "<authorization_code>",
     *   "codeVerifier": "<pkce_code_verifier>",
     *   "redirectUri": "http://localhost:4200/auth/callback"
     * }
     *
     * Răspuns (success):
     * {
     *   "id": "...",
     *   "email": "user@example.com",
     *   "fullName": "User Name",
     *   "role": "ADMIN",
     *   "specialization": null,
     *   "phone": null,
     *   "department": null
     * }
     *
     * Răspuns (error):
     * {
     *   "status": 400,
     *   "message": "Invalid authorization code",
     *   "details": "...",
     *   "timestamp": "2026-05-05T10:00:00"
     * }
     */
    @PostMapping("/exchange-code")
    @Operation(summary = "Schimb authorization code pe access token și user info",
               description = "Primește authorization code PKCE și returnează user info cu token setat în cookie HttpOnly")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Exchange cu succes, user info returnate",
                     content = @Content(mediaType = "application/json", schema = @Schema(implementation = CurrentUserResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid code, verifier, sau redirect_uri"),
        @ApiResponse(responseCode = "500", description = "Eroare la exchange-ul codului")
    })
    public ResponseEntity<?> exchangeCode(@RequestBody AuthExchangeCodeRequest request) {
        try {
            // Construim apelul către /oauth2/token intern folosind WebClient (reactive)
            Map<String, Object> tokenResponse = webClient.post()
                    .uri(authProperties.getTokenEndpoint())
                    .accept(MediaType.APPLICATION_JSON)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData("grant_type", "authorization_code")
                            .with("code", request.code())
                            .with("redirect_uri", request.redirectUri())
                            .with("client_id", "or-scheduler-ui")
                            .with("code_verifier", request.codeVerifier()))
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), resp ->
                        resp.bodyToMono(String.class).map(body -> new RuntimeException("Token endpoint error: " + body))
                    )
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block(Duration.ofSeconds(authProperties.getWebClientTimeoutSeconds()));

            if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
                return ResponseEntity.status(400).body(new ErrorResponse(400, "Invalid token response", "No access_token in response", LocalDateTime.now()));
            }

            String accessToken = tokenResponse.get("access_token").toString();
            Integer expiresIn = tokenResponse.containsKey("expires_in") ? ((Number) tokenResponse.get("expires_in")).intValue() : 3600;
            String refreshToken = tokenResponse.containsKey("refresh_token") ? tokenResponse.get("refresh_token").toString() : null;

            // Decode token pentru a extrage subject (email)
            Jwt jwt = null;
            try {
                jwt = this.jwtDecoder.decode(accessToken);
            } catch (Exception ex) {
                // dacă decodarea eșuează, continuăm și încercăm să extragem sub direct din token (nu recomandat)
            }

            String subject = null;
            if (jwt != null && jwt.getSubject() != null) subject = jwt.getSubject();
            if (subject == null) subject = tokenResponse.getOrDefault("sub", tokenResponse.getOrDefault("id_token", "")).toString();

            // Obținem user info din baza de date folosind subject ca email (convenție în proiect)
            CurrentUserResponse userInfo;
            try {
                userInfo = authService.getUserByEmail(subject);
            } catch (Exception e) {
                // dacă nu găsim user după email, returnăm doar sub-ul în response minimal
                userInfo = new CurrentUserResponse(subject, subject, subject, "", null, null, null);
            }

            // Creăm cookie HttpOnly pentru access_token (Secure flag din proprietăți)
            ResponseCookie.ResponseCookieBuilder accessCookieBuilder = ResponseCookie.from("access_token", accessToken)
                    .httpOnly(true)
                    .path("/")
                    .maxAge(Duration.ofSeconds(expiresIn))
                    .sameSite(authProperties.getCookieSameSite());
            if (authProperties.isCookieSecure()) accessCookieBuilder.secure(true);
            ResponseCookie accessCookie = accessCookieBuilder.build();

            HttpHeaders respHeaders = new HttpHeaders();
            respHeaders.add(HttpHeaders.SET_COOKIE, accessCookie.toString());
            if (refreshToken != null) {
                ResponseCookie.ResponseCookieBuilder refreshBuilder = ResponseCookie.from("refresh_token", refreshToken)
                        .httpOnly(true)
                        .path("/api/auth/refresh")
                        .maxAge(Duration.ofDays(30))
                        .sameSite(authProperties.getCookieSameSite());
                if (authProperties.isCookieSecure()) refreshBuilder.secure(true);
                ResponseCookie refreshCookie = refreshBuilder.build();
                respHeaders.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());
            }

            // Audit
            auditService.record("exchange_code", subject, "exchange successful");

            return ResponseEntity.ok().headers(respHeaders).body(userInfo);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                new ErrorResponse(
                    500,
                    "Exchange code failed",
                    e.getMessage(),
                    LocalDateTime.now()
                )
            );
        }
    }

    /**
     * POST /api/auth/refresh
     * Refresh access token cu ajutorul refresh token-ului.
     * (Optional - pentru mai târziu dacă se implementează refresh token flow)
     */
    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token",
               description = "Obține access token nou cu ajutorul refresh token-ului")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token refreshed cu succes"),
        @ApiResponse(responseCode = "401", description = "Refresh token invalid sau expirat")
    })
    public ResponseEntity<?> refreshToken() {
        return ResponseEntity.status(400).body(
            new ErrorResponse(400, "Bad Request", "Use POST /api/auth/refresh with refresh_token cookie", LocalDateTime.now())
        );
    }

    @PostMapping(value = "/refresh", consumes = "application/json")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        try {
            // extragem cookie-ul refresh_token
            Cookie[] cookies = request.getCookies();
            if (cookies == null) {
                return ResponseEntity.status(401).body(new ErrorResponse(401, "Unauthorized", "No cookies present", LocalDateTime.now()));
            }

            String refreshToken = null;
            for (Cookie c : cookies) {
                if ("refresh_token".equals(c.getName())) {
                    refreshToken = c.getValue();
                    break;
                }
            }

            if (refreshToken == null || refreshToken.isBlank()) {
                return ResponseEntity.status(401).body(new ErrorResponse(401, "Unauthorized", "Refresh token cookie missing", LocalDateTime.now()));
            }

            // apel intern la /oauth2/token cu grant_type=refresh_token
            Map<String, Object> tokenResponse = webClient.post()
                    .uri(authProperties.getTokenEndpoint())
                    .accept(MediaType.APPLICATION_JSON)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData("grant_type", "refresh_token")
                            .with("refresh_token", refreshToken)
                            .with("client_id", "or-scheduler-ui"))
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), resp ->
                        resp.bodyToMono(String.class).map(body -> new RuntimeException("Token endpoint error: " + body))
                    )
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block(Duration.ofSeconds(authProperties.getWebClientTimeoutSeconds()));

            if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
                return ResponseEntity.status(400).body(new ErrorResponse(400, "Invalid token response", "No access_token in response", LocalDateTime.now()));
            }

            String accessToken = tokenResponse.get("access_token").toString();
            Integer expiresIn = tokenResponse.containsKey("expires_in") ? ((Number) tokenResponse.get("expires_in")).intValue() : 3600;
            String newRefresh = tokenResponse.containsKey("refresh_token") ? tokenResponse.get("refresh_token").toString() : null;

            // decode access token to get subject
            Jwt jwt = null;
            try { jwt = this.jwtDecoder.decode(accessToken); } catch (Exception ex) { }
            String subject = null;
            if (jwt != null && jwt.getSubject() != null) subject = jwt.getSubject();
            if (subject == null) subject = tokenResponse.getOrDefault("sub", "").toString();

            CurrentUserResponse userInfo;
            try { userInfo = authService.getUserByEmail(subject); }
            catch (Exception e) { userInfo = new CurrentUserResponse(subject, subject, subject, "", null, null, null); }

            // set cookies
            ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
                    .httpOnly(true)
                    .path("/")
                    .maxAge(Duration.ofSeconds(expiresIn))
                    .sameSite("Lax")
                    .build();

            HttpHeaders respHeaders = new HttpHeaders();
            respHeaders.add(HttpHeaders.SET_COOKIE, accessCookie.toString());
            if (newRefresh != null) {
                ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", newRefresh)
                        .httpOnly(true)
                        .path("/api/auth/refresh")
                        .maxAge(Duration.ofDays(30))
                        .sameSite("Lax")
                        .build();
                respHeaders.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());
            }

            return ResponseEntity.ok().headers(respHeaders).body(userInfo);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse(500, "Refresh failed", e.getMessage(), LocalDateTime.now()));
        }
    }
}

