package suminjn.nextbill.domain;

import jakarta.persistence.*;
import lombok.*;
import suminjn.nextbill.domain.enums.BillingCycle;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "subscriptions")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long subscriptionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer cost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillingCycle billingCycle;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate nextPaymentDate;

    @Column(nullable = false)
    private Boolean isPaused;

    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "subscription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AlertStatus> alertStatuses;

    // 비즈니스 메서드
    public void pause() {
        this.isPaused = true;
    }

    public void resume() {
        this.isPaused = false;
    }

    public void updateDetails(String name, Integer cost, BillingCycle billingCycle, LocalDate nextPaymentDate) {
        this.name = name;
        this.cost = cost;
        this.billingCycle = billingCycle;
        this.nextPaymentDate = nextPaymentDate;
    }

    public void updateNextPaymentDate(LocalDate nextPaymentDate) {
        this.nextPaymentDate = nextPaymentDate;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setSubscriptionId(Long subscriptionId) {
        this.subscriptionId = subscriptionId;
    }
}
