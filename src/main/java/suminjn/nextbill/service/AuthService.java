package suminjn.nextbill.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import suminjn.nextbill.domain.User;
import suminjn.nextbill.dto.LoginRequestDto;
import suminjn.nextbill.dto.LoginResponseDto;
import suminjn.nextbill.dto.RefreshTokenRequestDto;
import suminjn.nextbill.dto.UserResponseDto;
import suminjn.nextbill.repository.UserRepository;
import suminjn.nextbill.security.JwtProvider;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenService refreshTokenService;

    public LoginResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getUserEmail());
        if (user == null || !passwordEncoder.matches(request.getUserPassword(), user.getPassword())) {
            throw new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        String accessToken = jwtProvider.generateAccessToken(user.getEmail());
        String refreshToken = jwtProvider.generateRefreshToken(user.getEmail());
        refreshTokenService.save(user.getEmail(), refreshToken);

        UserResponseDto userResponseDto = UserResponseDto.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .isEmailAlertEnabled(user.getIsEmailAlertEnabled())
                .build();

        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userResponseDto)
                .build();
    }

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