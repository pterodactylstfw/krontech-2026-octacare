package octacare.orschedulercore.config;

import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@ConfigurationPropertiesScan(basePackages = "octacare.orschedulercore")
public class AppConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // authenticationManager is provided by SecurityConfig to avoid duplicate bean definition
    // kept out of AppConfig to prevent BeanDefinitionOverrideException
}