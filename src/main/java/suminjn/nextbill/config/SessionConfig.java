package suminjn.nextbill.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.SessionCookieConfig;

@Configuration
@Slf4j
public class SessionConfig {
    
    @Value("${spring.profiles.active:local}")
    private String activeProfile;
    
    @Bean
    public ServletContextInitializer servletContextInitializer() {
        return new ServletContextInitializer() {
            @Override
            public void onStartup(ServletContext servletContext) throws ServletException {
                SessionCookieConfig sessionCookieConfig = servletContext.getSessionCookieConfig();
                
                // 기본 설정
                sessionCookieConfig.setName("JSESSIONID");
                sessionCookieConfig.setPath("/");
                sessionCookieConfig.setHttpOnly(true);
                sessionCookieConfig.setMaxAge(1800); // 30분
                
                // 프로덕션 환경 설정
                if ("prod".equals(activeProfile)) {
                    log.info("프로덕션 환경 세션 쿠키 설정 적용");
                    sessionCookieConfig.setSecure(true);
                    // SameSite는 application.yml에서 설정
                } else {
                    log.info("개발 환경 세션 쿠키 설정 적용");
                    sessionCookieConfig.setSecure(false);
                }
                
                log.info("세션 쿠키 설정 완료 - Name: {}, Path: {}, MaxAge: {}, Secure: {}, HttpOnly: {}", 
                        sessionCookieConfig.getName(), 
                        sessionCookieConfig.getPath(),
                        sessionCookieConfig.getMaxAge(),
                        sessionCookieConfig.isSecure(),
                        sessionCookieConfig.isHttpOnly());
            }
        };
    }
}
