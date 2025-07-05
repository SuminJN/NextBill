package suminjn.nextbill.domain.enums;

public enum NotificationType {
    PAYMENT_DUE,        // 결제 예정
    PAYMENT_TODAY,      // 오늘 결제
    PAYMENT_OVERDUE,    // 결제일 지남
    SUBSCRIPTION_ADDED, // 구독 추가
    SUBSCRIPTION_PAUSED, // 구독 일시정지
    SUBSCRIPTION_RESUMED, // 구독 재개
    SYSTEM              // 시스템 알림
}
