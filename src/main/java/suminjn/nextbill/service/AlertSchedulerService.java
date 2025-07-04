package suminjn.nextbill.service;

import suminjn.nextbill.domain.enums.AlertType;
import suminjn.nextbill.domain.Subscription;
import suminjn.nextbill.dto.SubscriptionAlertEvent;
import suminjn.nextbill.kafka.SubscriptionAlertProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertSchedulerService {

    private final SubscriptionService subscriptionService;
    private final SubscriptionAlertProducer alertProducer;

    @Scheduled(cron = "0 0 0 * * *")
    public void sendD7Alerts() {
        sendAlertsByOffset(7, AlertType.D_7);
    }

    @Scheduled(cron = "0 5 0 * * *")
    public void sendD3Alerts() {
        sendAlertsByOffset(3, AlertType.D_3);
    }

    @Scheduled(cron = "0 10 0 * * *")
    public void sendD1Alerts() {
        sendAlertsByOffset(1, AlertType.D_1);
    }

    private void sendAlertsByOffset(int daysBefore, AlertType alertType) {
        LocalDate targetDate = LocalDate.now().plusDays(daysBefore);
        List<Subscription> dueSubscriptions = subscriptionService.findDueToday(targetDate);

        for (Subscription sub : dueSubscriptions) {
            SubscriptionAlertEvent event = SubscriptionAlertEvent.builder()
                    .subscriptionId(sub.getSubscriptionId())
                    .userEmail(sub.getUser().getEmail())
                    .serviceName(sub.getName())
                    .alertDate(targetDate)
                    .alertType(alertType)
                    .build();

            // Kafka로 알림 이벤트 전송
            alertProducer.send(event);
        }

        log.info("📆 {} 알림 전송 완료 ({}건): {}", alertType, dueSubscriptions.size(), targetDate);
    }
}
