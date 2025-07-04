package suminjn.nextbill.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import suminjn.nextbill.domain.AlertStatus;
import suminjn.nextbill.domain.enums.AlertType;

import java.time.LocalDate;

@Repository
public interface AlertStatusRepository extends JpaRepository<AlertStatus, Long> {
    boolean existsBySubscription_SubscriptionIdAndAlertDateAndAlertType(Long subscriptionId, LocalDate alertDate, AlertType alertType);
}