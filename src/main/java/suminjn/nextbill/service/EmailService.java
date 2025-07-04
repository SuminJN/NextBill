package suminjn.nextbill.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
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
}
