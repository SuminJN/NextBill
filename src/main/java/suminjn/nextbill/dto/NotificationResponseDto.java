package suminjn.nextbill.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import suminjn.nextbill.domain.Notification;
import suminjn.nextbill.domain.enums.NotificationPriority;
import suminjn.nextbill.domain.enums.NotificationType;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDto {
    private Long id;
    private String message;
    private NotificationType type;
    private NotificationPriority priority;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private Integer daysUntil;
    private String subscriptionName;

    public static NotificationResponseDto from(Notification notification) {
        return NotificationResponseDto.builder()
                .id(notification.getNotificationId())
                .message(notification.getMessage())
                .type(notification.getType())
                .priority(notification.getPriority())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .daysUntil(notification.getDaysUntil())
                .subscriptionName(notification.getSubscription() != null ? 
                    notification.getSubscription().getName() : null)
                .build();
    }
}
