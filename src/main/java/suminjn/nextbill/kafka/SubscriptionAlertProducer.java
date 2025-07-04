package suminjn.nextbill.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import suminjn.nextbill.dto.SubscriptionAlertEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionAlertProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    private static final String TOPIC = "subscription.alert.scheduled";

    public void send(SubscriptionAlertEvent event) {
        try {
            String message = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC, message);
            log.info("📤 Kafka 알림 이벤트 전송 완료: {}", message);
        } catch (JsonProcessingException e) {
            log.error("❌ Kafka 메시지 직렬화 실패: {}", event, e);
        }
    }
}
