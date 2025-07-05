package suminjn.nextbill.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import suminjn.nextbill.domain.Subscription;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUser_UserId(Long userId);
    List<Subscription> findByNextPaymentDate(LocalDate date);
    List<Subscription> findByIsPausedFalseAndNextPaymentDate(LocalDate date);
    List<Subscription> findByIsPausedFalse();
}