package suminjn.nextbill.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import suminjn.nextbill.domain.AlertStatus;
import suminjn.nextbill.domain.enums.AlertType;
import suminjn.nextbill.repository.AlertStatusRepository;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AlertStatusService {

    private final AlertStatusRepository alertStatusRepository;

    public boolean isAlreadySent(Long subscriptionId, LocalDate date, AlertType type) {
        return alertStatusRepository.existsBySubscription_SubscriptionIdAndAlertDateAndAlertType(subscriptionId, date, type);
    }

    public AlertStatus save(AlertStatus alertStatus) {
        return alertStatusRepository.save(alertStatus);
    }
}
