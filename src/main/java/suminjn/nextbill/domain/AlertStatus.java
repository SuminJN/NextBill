package suminjn.nextbill.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import suminjn.nextbill.domain.enums.AlertType;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "alert_statuses")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long alertStatusId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    @Column(nullable = false)
    private LocalDate alertDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertType alertType;

    @Column(nullable = false)
    private Boolean isSent;

    private LocalDateTime sentAt;
}