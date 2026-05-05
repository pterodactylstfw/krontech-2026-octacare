package octacare.orschedulercore.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.*;

/**
 * Filtru simplu care mută token-ul din cookie-ul "access_token" în header-ul
 * Authorization: Bearer <token> dacă acesta lipsește.
 *
 * Trebuie înregistrat înainte de mecanismele Spring Security care așteaptă Authorization header.
 */
public class CookieBearerTokenFilter extends OncePerRequestFilter {

    private static final String COOKIE_NAME = "access_token";
    private static final String AUTH_HEADER = "Authorization";
    private static final Logger log = LoggerFactory.getLogger(CookieBearerTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        log.debug("CookieBearerTokenFilter: Processing request to {}", request.getRequestURI());

        // Dacă există deja header Authorization, nu facem nimic
        if (request.getHeader(AUTH_HEADER) != null) {
            log.debug("Authorization header already present, skipping");
            filterChain.doFilter(request, response);
            return;
        }

        String token = extractTokenFromCookies(request);
        if (token == null) {
            log.debug("No token extracted from cookies, proceeding without Authorization header");
            filterChain.doFilter(request, response);
            return;
        }

        log.debug("Token extracted successfully, wrapping request with Authorization header");
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
        log.debug("request.getCookies() returned: {}", cookies == null ? "null" : "array with " + cookies.length + " cookies");

        if (cookies != null) {
            for (Cookie c : cookies) {
                log.debug("Found cookie: name={}, value_length={}", c.getName(), c.getValue().length());
                if (COOKIE_NAME.equals(c.getName())) return c.getValue();
            }
        }
        // Fallback: dacă containerul nu populează request.getCookies(), încercăm să parsăm header-ul "Cookie"
        String cookieHeader = request.getHeader("Cookie");
        log.debug("Cookie header: {}", cookieHeader == null ? "null" : "length=" + cookieHeader.length());

        if (cookieHeader == null || cookieHeader.isBlank()) return null;
        // header format: "name1=value1; name2=value2"
        String[] parts = cookieHeader.split(";");
        log.debug("Cookie header parts count: {}", parts.length);

        for (String p : parts) {
            String[] nv = p.split("=", 2);
            log.debug("Parsing part: name_value_count={}", nv.length);
            if (nv.length == 2) {
                String name = nv[0].trim();
                String value = nv[1].trim();
                log.debug("Extracted cookie name: {}", name);
                if (COOKIE_NAME.equals(name)) return value;
            }
        }
        return null;
    }
}

