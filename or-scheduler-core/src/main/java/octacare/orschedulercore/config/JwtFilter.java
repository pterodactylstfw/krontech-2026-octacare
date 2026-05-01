package octacare.orschedulercore.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
// import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
// import org.fleetops.gateway.repository.TokenRepository;
// import org.fleetops.gateway.service.JwtService;
// import org.springframework.context.annotation.Bean;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
// @RequiredArgsConstructor
@Slf4j
public class JwtFilter extends OncePerRequestFilter {

    /*
     * TODO: De reactivat când există implementările locale:
     *
     * private final JwtService jwtService;
     * private final TokenRepository tokenRepository;
     * private final UserDetailsService userDetailsService;
     *
     * Momentan clasele erau importate din alt proiect:
     * org.fleetops.gateway.repository.TokenRepository
     * org.fleetops.gateway.service.JwtService
     */

    /*
     * TODO: Mută acest bean într-o clasă de SecurityConfig dacă mai ai nevoie de el.
     * Nu este ideal să declari WebSecurityCustomizer în interiorul filtrului.
     *
     * @Bean
     * public WebSecurityCustomizer webSecurityCustomizer() {
     *     return (web) -> web.ignoring().requestMatchers("/tracking/**");
     * }
     */

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        /*
         * TODO: Logica JWT reală va fi reactivată după ce există:
         * - JwtService/JwtUtils
         * - UserDetailsService
         * - UserRepository
         * - opțional TokenRepository pentru blacklist/revoked tokens
         *
         * Momentan lăsăm request-ul să treacă mai departe ca aplicația să poată porni.
         */

        filterChain.doFilter(request, response);

        /*
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String tokenFromHeader = authHeader.substring(7);

        String usernameByHeader = jwtService.extractUsername(tokenFromHeader);

        log.info(">>> JWT Filter: Extracted Username from header: {}", usernameByHeader);

        if (usernameByHeader != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userFromHeader = userDetailsService.loadUserByUsername(usernameByHeader);

            var tokenOptional = tokenRepository.findByAccessToken(tokenFromHeader);

            boolean isTokenValidInDb = tokenOptional
                    .map(t -> !t.isBlacklisted())
                    .orElse(false);

            boolean isCryptoValid = jwtService.isTokenValid(tokenFromHeader, userFromHeader);
            log.debug("Crypto Validation passed: {}", isCryptoValid);

            if (isCryptoValid && isTokenValidInDb) {
                log.info("Authentication successful for user: {}", usernameByHeader);
                log.debug("User Authorities: {}", userFromHeader.getAuthorities());

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userFromHeader,
                        null,
                        userFromHeader.getAuthorities()
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                log.warn("Authentication failed for user: {}. Token valid in DB: {}, Crypto valid: {}",
                        usernameByHeader, isTokenValidInDb, isCryptoValid);
            }
        }

        filterChain.doFilter(request, response);
        */
    }

    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return false;
    }

    @Override
    protected boolean shouldNotFilterErrorDispatch() {
        return false;
    }
}