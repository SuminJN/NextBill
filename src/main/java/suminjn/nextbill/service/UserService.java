package suminjn.nextbill.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import suminjn.nextbill.domain.User;
import suminjn.nextbill.dto.UserRequestDto;
import suminjn.nextbill.dto.UserResponseDto;
import suminjn.nextbill.exception.DuplicateEmailException;
import suminjn.nextbill.exception.EntityNotFoundException;
import suminjn.nextbill.repository.UserRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public UserResponseDto register(UserRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("이미 존재하는 이메일입니다.");
        }

        User user = request.toEntity();
        user.updatePassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);
        return UserResponseDto.from(saved);
    }

    public UserResponseDto getUserById(Long userId) {
        return userRepository.findById(userId)
                .map(UserResponseDto::from)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. ID: " + userId));
    }

    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserResponseDto getUserResponseByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new EntityNotFoundException("사용자를 찾을 수 없습니다. Email: " + email);
        }
        return UserResponseDto.from(user);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public UserResponseDto updateUser(Long userId, UserRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. ID: " + userId));
        
        // 이메일이 변경되는 경우 중복 체크
        if (!user.getEmail().equals(request.getEmail()) && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("이미 존재하는 이메일입니다.");
        }
        
        user.updateEmail(request.getEmail());
        user.updateEmailAlertEnabled(request.getIsEmailAlertEnabled());
        
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.updatePassword(passwordEncoder.encode(request.getPassword()));
        }
        
        User saved = userRepository.save(user);
        return UserResponseDto.from(saved);
    }

    @Transactional
    public UserResponseDto updateEmailAlertSetting(Long userId, Boolean isEmailAlertEnabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. ID: " + userId));
        
        user.updateEmailAlertEnabled(isEmailAlertEnabled);
        User saved = userRepository.save(user);
        return UserResponseDto.from(saved);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. ID: " + userId));
        
        userRepository.delete(user);
    }
}
