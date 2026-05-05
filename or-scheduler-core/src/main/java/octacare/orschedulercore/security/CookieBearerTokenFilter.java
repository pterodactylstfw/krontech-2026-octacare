package octacare.orschedulercore.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.*;

/**
 * Filtru simplu care mută token-ul din cookie-ul "access_token" în header-ul
 * Authorization: Bearer <token> dacă acesta lipsește.
 *
 * Trebuie înregistrat înainte de mecanismele Spring Security care așteaptă Authorization header.
 */
@Component
public class CookieBearerTokenFilter extends OncePerRequestFilter {

    private static final String COOKIE_NAME = "access_token";
    private static final String AUTH_HEADER = "Authorization";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // Dacă există deja header Authorization, nu facem nimic
        if (request.getHeader(AUTH_HEADER) != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = extractTokenFromCookies(request);
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Wrapper care adaugă header-ul Authorization
        HttpServletRequestWrapper wrapper = new HttpServletRequestWrapper(request) {
            @Override
            public String getHeader(String name) {
                if (AUTH_HEADER.equalsIgnoreCase(name)) {
                    return "Bearer " + token;
                }
                return super.getHeader(name);
            }

            @Override
            public Enumeration<String> getHeaders(String name) {
                if (AUTH_HEADER.equalsIgnoreCase(name)) {
                    return Collections.enumeration(List.of("Bearer " + token));
                }
                return super.getHeaders(name);
            }

            @Override
            public Enumeration<String> getHeaderNames() {
                List<String> names = Collections.list(super.getHeaderNames());
                if (!names.contains(AUTH_HEADER)) names.add(AUTH_HEADER);
                return Collections.enumeration(names);
            }
        };

        filterChain.doFilter(wrapper, response);
    }

    private String extractTokenFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) {
            if (COOKIE_NAME.equals(c.getName())) return c.getValue();
        }
        return null;
    }
}

