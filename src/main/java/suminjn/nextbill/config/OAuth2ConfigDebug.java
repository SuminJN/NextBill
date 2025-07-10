package suminjn.nextbill.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class OAuth2ConfigDebug implements CommandLineRunner {
    
    @Value("${spring.security.oauth2.client.registration.google.client-id:NOT_SET}")
    private String googleClientId;
    
    @Value("${spring.security.oauth2.client.registration.google.redirect-uri:NOT_SET}")
    private String redirectUri;
    
    @Value("${app.frontend.url:NOT_SET}")
    private String frontendUrl;
    
    @Override
    public void run(String... args) throws Exception {
        log.info("=== OAuth2 설정 확인 ===");
        log.info("Google Client ID: {}", googleClientId.substring(0, Math.min(10, googleClientId.length())) + "...");
        log.info("Redirect URI: {}", redirectUri);
        log.info("Frontend URL: {}", frontendUrl);
        log.info("========================");
    }
}
