package octacare.orschedulercore.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/login")
    public String loginPage() {
        // Returnează numele fișierului HTML (fără extensia .html) din folderul templates
        return "login";
    }
}