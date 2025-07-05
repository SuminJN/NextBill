package suminjn.nextbill.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import suminjn.nextbill.domain.Notification;
import suminjn.nextbill.domain.Subscription;
import suminjn.nextbill.domain.User;
import suminjn.nextbill.domain.enums.NotificationPriority;
import suminjn.nextbill.domain.enums.NotificationType;
import suminjn.nextbill.dto.NotificationRequestDto;
import suminjn.nextbill.dto.NotificationResponseDto;
import suminjn.nextbill.exception.EntityNotFoundException;
import suminjn.nextbill.repository.NotificationRepository;
import suminjn.nextbill.repository.SubscriptionRepository;
import suminjn.nextbill.repository.UserRepository;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;

    // 사용자별 알림 조회
    public List<NotificationResponseDto> getNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return notifications.stream()
                .map(NotificationResponseDto::from)
                .collect(Collectors.toList());
    }

    // 읽지 않은 알림 개수 조회
    public long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    // 알림 읽음 처리
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("알림을 찾을 수 없습니다."));

        // 본인의 알림인지 확인
        if (!notification.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인의 알림만 읽음 처리할 수 있습니다.");
        }

        notification.markAsRead();
        notificationRepository.save(notification);
    }

    // 모든 알림 읽음 처리
    @Transactional
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        List<Notification> unreadNotifications = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        unreadNotifications.forEach(Notification::markAsRead);
        notificationRepository.saveAll(unreadNotifications);
    }

    // 알림 삭제
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("알림을 찾을 수 없습니다."));

        // 본인의 알림인지 확인
        if (!notification.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인의 알림만 삭제할 수 있습니다.");
        }

        notificationRepository.delete(notification);
    }

    // 모든 알림 삭제
    @Transactional
    public void clearAllNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        notificationRepository.deleteAllByUser(user);
    }

    // 알림 생성
    @Transactional
    public NotificationResponseDto createNotification(Long userId, NotificationRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        Subscription subscription = null;
        if (requestDto.getSubscriptionId() != null) {
            subscription = subscriptionRepository.findById(requestDto.getSubscriptionId())
                    .orElseThrow(() -> new EntityNotFoundException("구독을 찾을 수 없습니다."));
        }

        Notification notification = Notification.builder()
                .user(user)
                .subscription(subscription)
                .message(requestDto.getMessage())
                .type(requestDto.getType())
                .priority(requestDto.getPriority())
                .daysUntil(requestDto.getDaysUntil())
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);
        return NotificationResponseDto.from(notification);
    }

    // 구독 결제일 기반 알림 생성 (스케줄러에서 호출)
    @Transactional
    public void createPaymentNotifications() {
        log.info("결제일 기반 알림 생성 시작");

        LocalDate today = LocalDate.now();
        List<Subscription> subscriptions = subscriptionRepository.findByIsPausedFalse();

        for (Subscription subscription : subscriptions) {
            LocalDate nextPaymentDate = subscription.getNextPaymentDate();
            long daysUntil = ChronoUnit.DAYS.between(today, nextPaymentDate);

            // 3일 전 알림
            if (daysUntil == 3) {
                createPaymentNotification(subscription, NotificationType.PAYMENT_DUE, 
                    NotificationPriority.MEDIUM, (int) daysUntil);
            }
            // 오늘 결제 알림
            else if (daysUntil == 0) {
                createPaymentNotification(subscription, NotificationType.PAYMENT_TODAY, 
                    NotificationPriority.HIGH, (int) daysUntil);
            }
            // 결제일 지남 알림 (1일 후)
            else if (daysUntil == -1) {
                createPaymentNotification(subscription, NotificationType.PAYMENT_OVERDUE, 
                    NotificationPriority.HIGH, (int) Math.abs(daysUntil));
            }
        }

        log.info("결제일 기반 알림 생성 완료");
    }

    private void createPaymentNotification(Subscription subscription, NotificationType type, 
                                         NotificationPriority priority, int daysUntil) {
        String message = generatePaymentMessage(subscription, type, daysUntil);

        Notification notification = Notification.builder()
                .user(subscription.getUser())
                .subscription(subscription)
                .message(message)
                .type(type)
                .priority(priority)
                .daysUntil(daysUntil)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.info("알림 생성: {} - {}", subscription.getName(), message);
    }

    private String generatePaymentMessage(Subscription subscription, NotificationType type, int daysUntil) {
        switch (type) {
            case PAYMENT_DUE:
                return String.format("%s 구독이 %d일 후 결제됩니다.", subscription.getName(), daysUntil);
            case PAYMENT_TODAY:
                return String.format("%s 구독이 오늘 결제됩니다.", subscription.getName());
            case PAYMENT_OVERDUE:
                return String.format("%s 구독 결제일이 지났습니다.", subscription.getName());
            default:
                return String.format("%s 구독 관련 알림", subscription.getName());
        }
    }
}
