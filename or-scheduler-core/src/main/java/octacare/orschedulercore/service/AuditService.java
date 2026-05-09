package octacare.orschedulercore.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuditService {

    private final Logger log = LoggerFactory.getLogger(AuditService.class);

    public void record(String action, String principal, String details) {
        // For now we log audit events. Can be extended to persist to DB.
        log.info("AUDIT action={} principal={} details={} at={}", action, principal, details, Instant.now());
    }
}

