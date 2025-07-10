package suminjn.nextbill.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
@Slf4j
public class OAuth2AuthorizationConfig {
    
    @Bean
    public OAuth2AuthorizationRequestResolver authorizationRequestResolver(
            ClientRegistrationRepository clientRegistrationRepository) {
        
        DefaultOAuth2AuthorizationRequestResolver authorizationRequestResolver =
                new DefaultOAuth2AuthorizationRequestResolver(
                        clientRegistrationRepository, "/oauth2/authorization");
        
        return new OAuth2AuthorizationRequestResolver() {
            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
                log.info("OAuth2 Authorization Request resolve 호출됨: {}", request.getRequestURI());
                log.info("Query String: {}", request.getQueryString());
                log.info("Session ID: {}", request.getSession(false) != null ? request.getSession().getId() : "No session");
                
                OAuth2AuthorizationRequest result = authorizationRequestResolver.resolve(request);
                if (result != null) {
                    log.info("Authorization Request 생성됨: {}", result.getAuthorizationUri());
                    log.info("State parameter: {}", result.getState());
                } else {
                    log.warn("Authorization Request가 null입니다");
                }
                return result;
            }
            
            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
                log.info("OAuth2 Authorization Request resolve 호출됨 (clientId: {}): {}", clientRegistrationId, request.getRequestURI());
                log.info("Session ID: {}", request.getSession(false) != null ? request.getSession().getId() : "No session");
                
                OAuth2AuthorizationRequest result = authorizationRequestResolver.resolve(request, clientRegistrationId);
                if (result != null) {
                    log.info("Authorization Request 생성됨: {}", result.getAuthorizationUri());
                    log.info("State parameter: {}", result.getState());
                } else {
                    log.warn("Authorization Request가 null입니다 (clientId: {})", clientRegistrationId);
                }
                return result;
            }
        };
    }
}