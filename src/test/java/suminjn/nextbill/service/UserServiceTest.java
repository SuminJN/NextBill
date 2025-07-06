package suminjn.nextbill.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import suminjn.nextbill.domain.User;
import suminjn.nextbill.dto.UserRequestDto;
import suminjn.nextbill.dto.UserResponseDto;
import suminjn.nextbill.exception.DuplicateEmailException;
import suminjn.nextbill.exception.EntityNotFoundException;
import suminjn.nextbill.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    // 기존 회원가입 테스트 제거 - Google OAuth2만 사용
    /*
    @Test
    @DisplayName("회원가입 성공")
    void register_success() {
        // given
        UserRequestDto request = UserRequestDto.builder()
                .email("test@example.com")
                .password("password")
                .isEmailAlertEnabled(true)
                .build();

        User savedUser = User.builder()
                .userId(1L)
                .email("test@example.com")
                .password("encoded_password")
                .isEmailAlertEnabled(true)
                .build();

        given(userRepository.existsByEmail("test@example.com")).willReturn(false);
        given(passwordEncoder.encode("password")).willReturn("encoded_password");
        given(userRepository.save(any(User.class))).willReturn(savedUser);

        // when
        UserResponseDto result = userService.register(request);

        // then
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        assertThat(result.getIsEmailAlertEnabled()).isTrue();
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("이미 존재하는 이메일로 회원가입 시 예외 발생")
    void register_duplicateEmail_throwsException() {
        // given
        UserRequestDto request = UserRequestDto.builder()
                .email("existing@example.com")
                .password("password")
                .isEmailAlertEnabled(true)
                .build();

        given(userRepository.existsByEmail("existing@example.com")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessage("이미 존재하는 이메일입니다.");
    }
    */

    @Test
    @DisplayName("존재하지 않는 사용자 조회 시 예외 발생")
    void getUserById_notFound_throwsException() {
        // given
        given(userRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> userService.getUserById(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessage("사용자를 찾을 수 없습니다. ID: 999");
    }
}
