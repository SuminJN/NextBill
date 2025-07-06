package suminjn.nextbill.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import suminjn.nextbill.service.EmailService;
import suminjn.nextbill.repository.UserRepository;
import suminjn.nextbill.domain.User;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
@Profile("local") // 로컬 개발 환경에서만 활성화
public class TestController {

    private final EmailService emailService;
    private final UserRepository userRepository;

    @PostMapping("/email")
    public ResponseEntity<Map<String, String>> sendTestEmail(
            @RequestParam String toEmail,
            @RequestParam(required = false, defaultValue = "이메일 발송 테스트입니다.") String message) {
        
        try {
            log.info("테스트 이메일 발송 요청 - 수신자: {}, 메시지: {}", toEmail, message);
            emailService.sendTestEmail(toEmail, message);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "테스트 이메일이 성공적으로 발송되었습니다.",
                "recipient", toEmail
            ));
        } catch (Exception e) {
            log.error("테스트 이메일 발송 실패", e);
            
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "이메일 발송에 실패했습니다: " + e.getMessage(),
                "recipient", toEmail
            ));
        }
    }

    @PostMapping("/reset-user")
    public ResponseEntity<Map<String, String>> resetUser(@RequestParam String email) {
        try {
            User user = userRepository.findByEmail(email);
            if (user != null) {
                user.updateName(null);
                user.updatePassword(null);
                userRepository.save(user);
                
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "사용자 정보가 초기화되었습니다",
                    "email", email
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "사용자를 찾을 수 없습니다"
                ));
            }
        } catch (Exception e) {
            log.error("사용자 초기화 실패", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "사용자 초기화에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}
