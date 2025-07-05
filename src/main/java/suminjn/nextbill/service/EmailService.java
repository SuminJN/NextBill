package suminjn.nextbill.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
                event.getAlertType());
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
}
