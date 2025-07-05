package suminjn.nextbill.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import suminjn.nextbill.domain.enums.NotificationPriority;
import suminjn.nextbill.domain.enums.NotificationType;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequestDto {
    private String message;
    private NotificationType type;
    private NotificationPriority priority;
    private Integer daysUntil;
    private Long subscriptionId;
}
