package suminjn.nextbill.service;

import suminjn.nextbill.domain.enums.AlertType;
import suminjn.nextbill.domain.enums.BillingCycle;
import suminjn.nextbill.domain.Subscription;
import suminjn.nextbill.domain.User;
import suminjn.nextbill.dto.SubscriptionAlertEvent;
import suminjn.nextbill.kafka.SubscriptionAlertProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertSchedulerService {

    private final SubscriptionService subscriptionService;
    private final SubscriptionAlertProducer alertProducer;

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional(readOnly = true)
    public void sendD7Alerts() {
        sendAlertsByOffset(7, AlertType.D_7);
    }

    @Scheduled(cron = "0 5 0 * * *")
    @Transactional(readOnly = true)
    public void sendD3Alerts() {
        sendAlertsByOffset(3, AlertType.D_3);
    }

    @Scheduled(cron = "0 10 0 * * *")
    @Transactional(readOnly = true)
    public void sendD1Alerts() {
        sendAlertsByOffset(1, AlertType.D_1);
    }

    @Scheduled(cron = "0 15 0 * * *")
    @Transactional(readOnly = true)
    public void sendDDayAlerts() {
        sendAlertsByOffset(0, AlertType.D_DAY);
    }

    @Scheduled(cron = "0 26 14 * * *")
    @Transactional
    public void updateOverduePaymentDates() {
        updateNextPaymentDates();
    }

    private void sendAlertsByOffset(int daysBefore, AlertType alertType) {
        LocalDate targetDate = LocalDate.now().plusDays(daysBefore);
        List<Subscription> dueSubscriptions = subscriptionService.findDueToday(targetDate);

        for (Subscription sub : dueSubscriptions) {
            // 사용자별 알림 설정 확인
            if (!shouldSendAlert(sub.getUser(), alertType)) {
                continue; // 해당 알림이 비활성화된 경우 건너뛰기
            }
            
            SubscriptionAlertEvent event = SubscriptionAlertEvent.builder()
                    .subscriptionId(sub.getSubscriptionId())
                    .userEmail(sub.getUser().getEmail())
                    .serviceName(sub.getName())
                    .alertDate(targetDate)
                    .alertType(alertType)
                    .alertTypeDisplay(alertType.getDisplayName()) // D-7, D-3, D-1 형식으로 표시
                    .build();

            // Kafka로 알림 이벤트 전송
            alertProducer.send(event);
        }

        log.info("📆 {} 알림 전송 완료 ({}건): {}", alertType.getDisplayName(), dueSubscriptions.size(), targetDate);
    }

    private void updateNextPaymentDates() {
        LocalDate today = LocalDate.now();
        List<Subscription> overdueSubscriptions = subscriptionService.findOverdueSubscriptions(today);

        for (Subscription subscription : overdueSubscriptions) {
            LocalDate currentPaymentDate = subscription.getNextPaymentDate();
            LocalDate newPaymentDate = calculateNextPaymentDate(currentPaymentDate, subscription.getBillingCycle());

            subscription.updateNextPaymentDate(newPaymentDate);
            subscriptionService.save(subscription);

            log.info("💳 결제일 업데이트: {} - {} → {}",
                    subscription.getName(), currentPaymentDate, newPaymentDate);
        }

        log.info("📅 총 {}건의 구독 결제일 업데이트 완료", overdueSubscriptions.size());
    }

    private boolean shouldSendAlert(User user, AlertType alertType) {
        // 전체 이메일 알림이 비활성화된 경우
        if (!user.getIsEmailAlertEnabled()) {
            return false;
        }
        
        // 알림 타입별 개별 설정 확인
        return switch (alertType) {
            case D_7 -> user.getEmailAlert7Days();
            case D_3 -> user.getEmailAlert3Days();
            case D_1 -> user.getEmailAlert1Day();
            case D_DAY -> user.getEmailAlertDDay();
        };
    }

    private LocalDate calculateNextPaymentDate(LocalDate currentDate, BillingCycle billingCycle) {
        return switch (billingCycle) {
            case MONTHLY -> currentDate.plusMonths(1);
            case YEARLY -> currentDate.plusYears(1);
            case WEEKLY -> currentDate.plusWeeks(1);
            case CUSTOM -> currentDate.plusMonths(1); // CUSTOM의 경우 기본값으로 월간 처리
        };
    }
}
