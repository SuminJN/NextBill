package suminjn.nextbill.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private final JwtProvider jwtProvider;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        log.info("OAuth2SuccessHandler.onAuthenticationSuccess 호출됨");
        log.info("Authentication 정보: {}", authentication.getClass().getSimpleName());
        log.info("Principal 정보: {}", authentication.getPrincipal().getClass().getSimpleName());
        
        OAuth2UserPrincipal principal = (OAuth2UserPrincipal) authentication.getPrincipal();
        String email = principal.getEmail();
        
        log.info("인증된 사용자 이메일: {}", email);
        
        // JWT 토큰 생성
        String accessToken = jwtProvider.generateAccessToken(email);
        String refreshToken = jwtProvider.generateRefreshToken(email);
        
        log.info("JWT 토큰 생성 완료 - AccessToken 길이: {}, RefreshToken 길이: {}", 
                accessToken.length(), refreshToken.length());
        
        log.info("OAuth2 로그인 성공 - 사용자: {}", email);
        log.info("Frontend URL 설정값: {}", frontendUrl);
        
        // 프론트엔드로 리다이렉트 (토큰을 쿼리 파라미터로 전달)
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/callback")
                .queryParam("token", accessToken)
                .queryParam("refreshToken", refreshToken);
        
        String targetUrl = builder.build().toUriString();
        log.info("리다이렉트 URL: {}", targetUrl);
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
        log.info("리다이렉트 실행 완료");
    }
}
