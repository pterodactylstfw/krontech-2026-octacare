package octacare.orschedulercore.config;

import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import reactor.netty.http.client.HttpClient;
import java.time.Duration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@Configuration
@ConfigurationPropertiesScan(basePackages = "octacare.orschedulercore")
@EnableConfigurationProperties(AuthProperties.class)
public class AppConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public org.springframework.web.reactive.function.client.WebClient webClient(org.springframework.web.reactive.function.client.WebClient.Builder builder) {
        return builder.build();
    }

    @Bean
    public org.springframework.web.reactive.function.client.WebClient.Builder webClientBuilder(AuthProperties props) {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(props.getWebClientTimeoutSeconds()));
        return org.springframework.web.reactive.function.client.WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient));
    }

    // authenticationManager is provided by SecurityConfig to avoid duplicate bean definition
    // kept out of AppConfig to prevent BeanDefinitionOverrideException
}