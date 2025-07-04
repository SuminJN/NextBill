package suminjn.nextbill.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import suminjn.nextbill.domain.AlertStatus;
import suminjn.nextbill.domain.Subscription;
import suminjn.nextbill.dto.SubscriptionAlertEvent;
import suminjn.nextbill.service.AlertStatusService;
import suminjn.nextbill.service.EmailService;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionAlertConsumer {

    private final ObjectMapper objectMapper;
    private final EmailService emailService;
    private final AlertStatusService alertStatusService;

    @KafkaListener(topics = "subscription.alert.scheduled", groupId = "nextbill-alert-consumer")
    public void listen(ConsumerRecord<String, String> record) {
        try {
            String message = record.value();
            SubscriptionAlertEvent event = objectMapper.readValue(message, SubscriptionAlertEvent.class);

            log.info("📥 Kafka 알림 수신: {}", event);

            boolean alreadySent = alertStatusService.isAlreadySent(
                    event.getSubscriptionId(),
                    event.getAlertDate(),
                    event.getAlertType()
            );

            if (alreadySent) {
                log.info("⚠️ 이미 전송된 알림 (중복 방지): {}", event);
                return;
            }

            emailService.sendAlert(event);

            alertStatusService.save(
                    AlertStatus.builder()
                            .subscription(Subscription.builder().subscriptionId(event.getSubscriptionId()).build())
                            .alertDate(event.getAlertDate())
                            .alertType(event.getAlertType())
                            .isSent(true)
                            .sentAt(java.time.LocalDateTime.now())
                            .build()
            );

        } catch (Exception e) {
            log.error("❌ Kafka 메시지 처리 실패: {}", record.value(), e);
        }
    }
}

