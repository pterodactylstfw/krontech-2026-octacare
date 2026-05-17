package octacare.orschedulercore.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @org.springframework.beans.factory.annotation.Value("${app.ui-url}")
    private String uiUrl;

    // activeaza CORS pentru toate rutele si permite cereri de la frontend-ul Angular
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    uiUrl, 
                    "http://localhost", 
                    "http://localhost:80", 
                    "http://localhost:4200", 
                    "http://127.0.0.1",
                    "http://127.0.0.1:80",
                    "http://16.170.35.111"
                )
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}