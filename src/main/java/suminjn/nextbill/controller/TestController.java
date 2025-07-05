package suminjn.nextbill.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import suminjn.nextbill.service.EmailService;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {

    private final EmailService emailService;

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
}
