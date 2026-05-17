package octacare.orschedulercore.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${spring.rabbitmq.host:localhost}")
    private String rabbitmqHost;

    @Value("${spring.rabbitmq.username:guest}")
    private String rabbitmqUser;

    @Value("${spring.rabbitmq.password:guest}")
    private String rabbitmqPass;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Use RabbitMQ as a broker relay
        config.enableStompBrokerRelay("/topic", "/queue")
                .setRelayHost(rabbitmqHost)
                .setRelayPort(61613)
                .setClientLogin(rabbitmqUser)
                .setClientPasscode(rabbitmqPass)
                .setSystemLogin(rabbitmqUser)
                .setSystemPasscode(rabbitmqPass)
                .setVirtualHost("/"); // Explicitly set default vhost
        
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/api/ws-notifications")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
