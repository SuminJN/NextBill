package suminjn.nextbill.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import suminjn.nextbill.domain.User;
import suminjn.nextbill.dto.LoginResponseDto;
import suminjn.nextbill.dto.RefreshTokenRequestDto;
import suminjn.nextbill.dto.UserResponseDto;
import suminjn.nextbill.repository.UserRepository;
import suminjn.nextbill.security.JwtProvider;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final RefreshTokenService refreshTokenService;

    // 기존 이메일/비밀번호 로그인 제거 - Google OAuth2만 사용

    public LoginResponseDto refreshToken(RefreshTokenRequestDto request) {
        String email = request.getUserEmail();
        String oldToken = request.getRefreshToken();

        if (!jwtProvider.validateToken(oldToken) || !refreshTokenService.isValid(email, oldToken)) {
            throw new BadCredentialsException("유효하지 않은 리프레시 토큰입니다.");
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new BadCredentialsException("사용자를 찾을 수 없습니다.");
        }

        String newAccessToken = jwtProvider.generateAccessToken(email);
        String newRefreshToken = jwtProvider.generateRefreshToken(email);

        refreshTokenService.save(email, newRefreshToken);

        UserResponseDto userResponseDto = UserResponseDto.from(user);

        return LoginResponseDto.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .user(userResponseDto)
                .build();
    }

    public void logout(String email) {
        refreshTokenService.delete(email);
    }
}