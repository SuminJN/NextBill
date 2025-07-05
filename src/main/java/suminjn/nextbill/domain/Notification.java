package suminjn.nextbill.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import suminjn.nextbill.domain.enums.NotificationPriority;
import suminjn.nextbill.domain.enums.NotificationType;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private Subscription subscription;

    @Column(nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationPriority priority;

    @Column(nullable = false)
    private Boolean isRead;

    private LocalDateTime readAt;

    @Column
    private Integer daysUntil;

    // 읽음 처리
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }

    // 생성자에서 기본값 설정
    @PrePersist
    protected void onCreate() {
        if (this.isRead == null) {
            this.isRead = false;
        }
        // BaseTimeEntity의 onCreate 호출
        if (this.getCreatedAt() == null) {
            this.setCreatedAt(LocalDateTime.now());
        }
        if (this.getUpdatedAt() == null) {
            this.setUpdatedAt(LocalDateTime.now());
        }
    }
}
