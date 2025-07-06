package suminjn.nextbill.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import suminjn.nextbill.domain.Notification;
import suminjn.nextbill.domain.User;
import suminjn.nextbill.dto.SubscriptionAlertEvent;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final Environment environment;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendAlert(SubscriptionAlertEvent event) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(event.getUserEmail());
            message.setSubject("[NextBill] 구독 결제 알림 - " + event.getServiceName());
            message.setText(buildMessage(event));
            message.setFrom(fromEmail);

            mailSender.send(message);
            log.info("✅ 이메일 전송 완료: {}", event.getUserEmail());
        } catch (Exception e) {
            log.error("❌ 이메일 전송 실패: {}", event, e);
        }
    }

    private String buildMessage(SubscriptionAlertEvent event) {
        return String.format("안녕하세요.\n\n다음 구독 결제가 예정되어 있습니다:\n\n서비스명: %s\n결제 예정일: %s (%s)\n\n감사합니다.\n- NextBill",
                event.getServiceName(),
                event.getAlertDate(),
                event.getAlertTypeDisplay()); // D-7, D-3, D-1 형식으로 표시
    }

    public void sendPaymentNotificationEmail(User user, Notification notification) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("NextBill - 구독 결제 알림");
            message.setText(buildEmailContent(notification));
            message.setFrom(fromEmail);

            mailSender.send(message);
            log.info("이메일 알림 발송 완료 - 사용자: {}, 메시지: {}", user.getEmail(), notification.getMessage());
        } catch (Exception e) {
            log.error("이메일 발송 실패 - 사용자: {}, 오류: {}", user.getEmail(), e.getMessage());
        }
    }

    private String buildEmailContent(Notification notification) {
        StringBuilder content = new StringBuilder();
        content.append("안녕하세요,\n\n");
        content.append(notification.getMessage()).append("\n\n");

        if (notification.getSubscription() != null) {
            content.append("구독 정보:\n");
            content.append("- 서비스명: ").append(notification.getSubscription().getName()).append("\n");
            content.append("- 결제 금액: ₩").append(notification.getSubscription().getCost().toString()).append("\n");
            content.append("- 다음 결제일: ").append(notification.getSubscription().getNextPaymentDate().toString()).append("\n\n");
        }

        content.append("NextBill에서 구독을 효율적으로 관리하세요.\n");
        content.append("감사합니다.\n\n");
        content.append("NextBill 팀");

        return content.toString();
    }

    // 테스트용 이메일 발송 메서드 (개발 환경에서만 사용)
    public void sendTestEmail(String toEmail, String testMessage) {
        // 개발 환경에서만 실행
        if (!isLocalProfile()) {
            log.warn("테스트 이메일 발송은 개발 환경에서만 가능합니다.");
            throw new IllegalStateException("테스트 이메일 발송은 개발 환경에서만 가능합니다.");
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("NextBill - 이메일 발송 테스트");
            message.setText(buildTestEmailContent(testMessage));
            message.setFrom(fromEmail);

            mailSender.send(message);
            log.info("✅ 테스트 이메일 전송 완료: {}", toEmail);
        } catch (Exception e) {
            log.error("❌ 테스트 이메일 전송 실패: {}", toEmail, e);
            throw new RuntimeException("이메일 발송 실패: " + e.getMessage(), e);
        }
    }
    
    private boolean isLocalProfile() {
        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if ("local".equals(profile)) {
                return true;
            }
        }
        return false;
    }

    private String buildTestEmailContent(String testMessage) {
        StringBuilder content = new StringBuilder();
        content.append("안녕하세요!\n\n");
        content.append("NextBill 이메일 발송 기능이 정상적으로 작동하고 있습니다.\n\n");

        if (testMessage != null && !testMessage.trim().isEmpty()) {
            content.append("테스트 메시지: ").append(testMessage).append("\n\n");
        }

        content.append("현재 시간: ").append(java.time.LocalDateTime.now().toString()).append("\n\n");
        content.append("NextBill에서 구독을 효율적으로 관리하세요.\n");
        content.append("감사합니다.\n\n");
        content.append("NextBill 팀");

        return content.toString();
    }
}
