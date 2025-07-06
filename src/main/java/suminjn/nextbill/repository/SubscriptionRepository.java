package suminjn.nextbill.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    // User 정보를 함께 fetch하는 메서드 (N+1 문제 해결)
    @Query("SELECT s FROM Subscription s JOIN FETCH s.user WHERE s.isPaused = false AND s.nextPaymentDate = :date")
    List<Subscription> findByIsPausedFalseAndNextPaymentDateWithUser(@Param("date") LocalDate date);
    
    // 연체된 구독 조회 (결제일이 지났지만 아직 업데이트되지 않은 구독)
    @Query("SELECT s FROM Subscription s JOIN FETCH s.user WHERE s.isPaused = false AND s.nextPaymentDate < :today")
    List<Subscription> findOverdueSubscriptionsWithUser(@Param("today") LocalDate today);
}