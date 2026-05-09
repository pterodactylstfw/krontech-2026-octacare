package octacare.orschedulercore.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.auth")
public class AuthProperties {

    /** Authorization server base url, default to localhost */
    private String tokenEndpoint = "http://localhost:8080/oauth2/token";
    private boolean cookieSecure = false;
    private String cookieSameSite = "Lax";
    private int webClientTimeoutSeconds = 10;

    public String getTokenEndpoint() {
        return tokenEndpoint;
    }

    public void setTokenEndpoint(String tokenEndpoint) {
        this.tokenEndpoint = tokenEndpoint;
    }

    public boolean isCookieSecure() {
        return cookieSecure;
    }

    public void setCookieSecure(boolean cookieSecure) {
        this.cookieSecure = cookieSecure;
    }

    public String getCookieSameSite() {
        return cookieSameSite;
    }

    public void setCookieSameSite(String cookieSameSite) {
        this.cookieSameSite = cookieSameSite;
    }

    public int getWebClientTimeoutSeconds() {
        return webClientTimeoutSeconds;
    }

    public void setWebClientTimeoutSeconds(int webClientTimeoutSeconds) {
        this.webClientTimeoutSeconds = webClientTimeoutSeconds;
    }
}

