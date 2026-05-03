package octacare.orschedulercore.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "<h1>Autentificare Reușită!</h1><p>Serverul Spring Boot te-a recunoscut și te-a logat cu succes.</p>";
    }
}