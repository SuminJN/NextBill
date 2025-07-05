package suminjn.nextbill.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import suminjn.nextbill.dto.NotificationRequestDto;
import suminjn.nextbill.dto.NotificationResponseDto;
import suminjn.nextbill.service.NotificationService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    // 사용자별 알림 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponseDto>> getNotifications(@PathVariable Long userId) {
        log.info("알림 조회 요청 - 사용자 ID: {}", userId);
        List<NotificationResponseDto> notifications = notificationService.getNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    // 읽지 않은 알림 개수 조회
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        long unreadCount = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
    }

    // 알림 읽음 처리
    @PutMapping("/{notificationId}/read/user/{userId}")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            @PathVariable Long userId) {
        
        log.info("알림 읽음 처리 - 알림 ID: {}, 사용자 ID: {}", notificationId, userId);
        notificationService.markAsRead(notificationId, userId);
        return ResponseEntity.ok().build();
    }

    // 모든 알림 읽음 처리
    @PutMapping("/user/{userId}/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        log.info("모든 알림 읽음 처리 - 사용자 ID: {}", userId);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    // 알림 삭제
    @DeleteMapping("/{notificationId}/user/{userId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notificationId,
            @PathVariable Long userId) {
        
        log.info("알림 삭제 - 알림 ID: {}, 사용자 ID: {}", notificationId, userId);
        notificationService.deleteNotification(notificationId, userId);
        return ResponseEntity.ok().build();
    }

    // 모든 알림 삭제
    @DeleteMapping("/user/{userId}/clear-all")
    public ResponseEntity<Void> clearAllNotifications(@PathVariable Long userId) {
        log.info("모든 알림 삭제 - 사용자 ID: {}", userId);
        notificationService.clearAllNotifications(userId);
        return ResponseEntity.ok().build();
    }

    // 알림 생성 (테스트용)
    @PostMapping("/user/{userId}")
    public ResponseEntity<NotificationResponseDto> createNotification(
            @PathVariable Long userId,
            @RequestBody NotificationRequestDto requestDto) {
        
        log.info("알림 생성 - 사용자 ID: {}, 메시지: {}", userId, requestDto.getMessage());
        NotificationResponseDto notification = notificationService.createNotification(userId, requestDto);
        return ResponseEntity.ok(notification);
    }

    // 결제일 기반 알림 생성 (관리자용)
    @PostMapping("/generate-payment-notifications")
    public ResponseEntity<Map<String, String>> generatePaymentNotifications() {
        log.info("결제일 기반 알림 생성 요청");
        notificationService.createPaymentNotifications();
        return ResponseEntity.ok(Map.of("message", "결제일 기반 알림이 생성되었습니다."));
    }
}
