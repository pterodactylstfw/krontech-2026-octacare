package octacare.orschedulercore.config;

// import lombok.RequiredArgsConstructor;
// import org.fleetops.gateway.repository.UserRepository;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.AuthenticationProvider;
// import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@ConfigurationPropertiesScan(basePackages = "octacare.orschedulercore")
// @RequiredArgsConstructor
public class AppConfig {

    /*
     * TODO: De reactivat când există UserRepository în proiectul curent.
     *
     * Momentan era importat din alt proiect:
     * org.fleetops.gateway.repository.UserRepository
     *
     * private final UserRepository repository;
     * private final PasswordEncoder passwordEncoder;
     */

    /*
     * TODO: De reactivat când User entity/repository implementează autentificarea reală.
     *
     * @Bean
     * public UserDetailsService userDetailsService() {
     *     return username -> repository.findByUsername(username)
     *             .orElseThrow(() -> new UsernameNotFoundException("User not found"));
     * }
     */

    /*
     * TODO: De reactivat după ce există UserDetailsService custom.
     *
     * @Bean
     * public AuthenticationProvider authenticationProvider() {
     *     DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
     *     authProvider.setUserDetailsService(userDetailsService());
     *     authProvider.setPasswordEncoder(passwordEncoder);
     *     return authProvider;
     * }
     */

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}