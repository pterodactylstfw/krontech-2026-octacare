package octacare.orschedulercore.config;

// import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
// import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
// import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
// @RequiredArgsConstructor
public class SecurityConfig {

    /*
     * TODO: De reactivat după ce JWT auth este complet:
     *
     * private final JwtFilter jwtFilter;
     * private final AppConfig appConfig;
     */

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        /*
                         * TEMPORAR: permitem toate request-urile ca aplicația să ruleze
                         * până terminăm UserRepository, JwtUtils/JwtService, AuthController etc.
                         */
                        .anyRequest().permitAll()
                );

        /*
         * TODO: De reactivat când autentificarea JWT este gata.
         *
         * .authorizeHttpRequests(auth -> auth
         *         .requestMatchers(
         *                 "/",
         *                 "/api/auth/**",
         *                 "/swagger-ui/**",
         *                 "/swagger-ui.html",
         *                 "/v3/api-docs/**"
         *         ).permitAll()
         *         .requestMatchers("/actuator/**").hasRole("ADMIN")
         *         .anyRequest().authenticated()
         * )
         * .sessionManagement(sess ->
         *         sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
         * .authenticationProvider(appConfig.authenticationProvider())
         * .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
         */

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        /*
         * Pentru development e ok.
         * Pentru production, înlocuiește "*" cu domeniul real al frontend-ului.
         */
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}