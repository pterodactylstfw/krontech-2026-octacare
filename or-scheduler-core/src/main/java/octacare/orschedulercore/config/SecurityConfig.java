package octacare.orschedulercore.config;

import octacare.orschedulercore.security.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.oidc.endpoint.OidcParameterNames;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    public SecurityConfig(CustomUserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public octacare.orschedulercore.security.CookieBearerTokenFilter cookieBearerTokenFilter() {
        return new octacare.orschedulercore.security.CookieBearerTokenFilter();
    }

    @Bean
    @Order(2) // 1. PASĂREA DE PRADĂ: Verificăm mai întâi dacă cererea e pentru API
    public SecurityFilterChain resourceServerFilterChain(HttpSecurity http, octacare.orschedulercore.security.CookieBearerTokenFilter cookieBearerTokenFilter) throws Exception {
        http
                .securityMatcher("/api/**") // Se aplică DOAR pentru rutele care încep cu /api/
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        // Allow unauthenticated access to the exchange & refresh endpoints so SPA or tools
                        // can perform the authorization_code PKCE exchange and refresh without an auth header.
                        .requestMatchers("/api/auth/exchange-code", "/api/auth/refresh").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                );
        // Adăugăm filtru care mută cookie->Authorization header ca PRIMUL filtru în lanț
         // pentru a extrage tokenul din cookie ÎNAINTE ca Bearer Token Authentication să încerce validarea
         http.addFilterBefore(cookieBearerTokenFilter, SecurityContextHolderFilter.class);
        return http.build();
    }

    @Bean
    @Order(3) // 2. PLASA DE SIGURANȚĂ: Tot ce nu e API intră aici (Login, UI, CSS)
    SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/", "/error", "/login", "/css/**", "/js/**",
                                "/images/**", "/favicon.ico", "/api/auth/login",
                                "/oauth2/**", "/swagger-ui/**", "/v3/api-docs/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .loginProcessingUrl("/login")
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login?logout")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                );
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        // Am șters "/.well-known/**" pentru a lăsa OAuth2AuthorizationServer să genereze ruta
        return (web) -> web.ignoring().requestMatchers("/css/**", "/js/**", "/images/**", "/favicon.ico", "/.well-known/appspecific/**");
    }

    @Bean
    public OAuth2TokenCustomizer<JwtEncodingContext> tokenCustomizer() {
        return context -> {
            // Verificăm dacă generăm un ID Token sau un Access Token
            if (OidcParameterNames.ID_TOKEN.equals(context.getTokenType().getValue()) ||
                    OAuth2TokenType.ACCESS_TOKEN.equals(context.getTokenType())) {

                // Luăm rolurile utilizatorului din baza de date (SecurityContext)
                Set<String> roles = context.getPrincipal().getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        // Filtrăm metadatele tehnice ca să nu trimitem "FACTOR_PASSWORD"
                        .filter(auth -> auth.startsWith("ROLE_"))
                        .map(auth -> auth.substring(5)) // Ștergem "ROLE_" pentru a nu dubla prefixul mai târziu
                        .collect(Collectors.toSet());

                // Le punem într-un câmp numit explicit "user_roles"
                context.getClaims().claim("user_roles", roles);
            }
        };
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        // Spunem converter-ului să caute rolurile în claim-ul "user_roles" pe care l-am creat anterior
        authoritiesConverter.setAuthoritiesClaimName("user_roles");
        // Prefixăm cu "ROLE_" pentru ca hasRole('ADMIN') să funcționeze corect în Spring
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return converter;
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Trebuie să fie adresa exactă a Angular-ului
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true); // Necesar pentru cookie-uri[cite: 1]

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}