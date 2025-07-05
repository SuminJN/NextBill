package suminjn.nextbill.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import suminjn.nextbill.domain.Notification;
import suminjn.nextbill.domain.User;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 사용자별 알림 조회 (최신순)
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    // 사용자별 읽지 않은 알림 조회
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    // 사용자별 읽지 않은 알림 개수
    long countByUserAndIsReadFalse(User user);

    // 특정 기간 이후의 알림 조회
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findByUserAndCreatedAtAfter(@Param("user") User user, @Param("since") LocalDateTime since);

    // 읽은 알림 삭제 (30일 이전)
    @Query("DELETE FROM Notification n WHERE n.user = :user AND n.isRead = true AND n.readAt < :before")
    void deleteReadNotificationsBefore(@Param("user") User user, @Param("before") LocalDateTime before);

    // 사용자의 모든 알림 삭제
    void deleteAllByUser(User user);
}
