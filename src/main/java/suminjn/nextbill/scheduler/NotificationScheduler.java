package suminjn.nextbill.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import suminjn.nextbill.service.NotificationService;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final NotificationService notificationService;

    // 매일 오전 9시에 결제일 기반 알림 생성
    @Scheduled(cron = "0 0 9 * * *")
    public void generateDailyPaymentNotifications() {
        log.info("일일 결제 알림 스케줄러 시작");
        try {
            notificationService.createPaymentNotifications();
            log.info("일일 결제 알림 스케줄러 완료");
        } catch (Exception e) {
            log.error("일일 결제 알림 스케줄러 실행 중 오류 발생", e);
        }
    }

    // 매주 일요일 자정에 오래된 읽은 알림 정리
    @Scheduled(cron = "0 0 0 * * SUN")
    public void cleanupOldNotifications() {
        log.info("오래된 알림 정리 스케줄러 시작");
        try {
            // TODO: 30일 이전의 읽은 알림 삭제 로직 구현
            log.info("오래된 알림 정리 스케줄러 완료");
        } catch (Exception e) {
            log.error("오래된 알림 정리 스케줄러 실행 중 오류 발생", e);
        }
    }
}
