package suminjn.nextbill.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import suminjn.nextbill.repository.UserRepository;
import suminjn.nextbill.domain.User;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2UserPrincipal principal = (OAuth2UserPrincipal) authentication.getPrincipal();
        String email = principal.getEmail();
        
        // 기존 사용자 확인
        User existingUser = userRepository.findByEmail(email);
        boolean isNewUser = existingUser == null;
        
        // JWT 토큰 생성
        String accessToken = jwtProvider.generateAccessToken(email);
        String refreshToken = jwtProvider.generateRefreshToken(email);
        
        log.info("OAuth2 로그인 성공 - 사용자: {}, 신규 사용자: {}", email, isNewUser);
        
        // 프론트엔드로 리다이렉트 (토큰과 신규 사용자 여부를 쿼리 파라미터로 전달)
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString("http://localhost:3000/auth/callback")
                .queryParam("token", accessToken)
                .queryParam("refreshToken", refreshToken);
        
        if (isNewUser) {
            builder.queryParam("isNewUser", "true");
        }
        
        String targetUrl = builder.build().toUriString();
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
