package suminjn.nextbill.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isEmailAlertEnabled = true;

    // 개별 이메일 알림 설정
    @Column(nullable = false)
    @Builder.Default
    private Boolean emailAlert7Days = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean emailAlert3Days = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean emailAlert1Day = true;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Subscription> subscriptions;

    public void updatePassword(String newPassword) {
        this.password = newPassword;
    }

    public void updateEmail(String newEmail) {
        this.email = newEmail;
    }

    public void updateEmailAlertEnabled(Boolean isEmailAlertEnabled) {
        this.isEmailAlertEnabled = isEmailAlertEnabled;
    }

    public void updateEmailAlert7Days(Boolean emailAlert7Days) {
        this.emailAlert7Days = emailAlert7Days;
    }

    public void updateEmailAlert3Days(Boolean emailAlert3Days) {
        this.emailAlert3Days = emailAlert3Days;
    }

    public void updateEmailAlert1Day(Boolean emailAlert1Day) {
        this.emailAlert1Day = emailAlert1Day;
    }

    public void updateEmailAlertSettings(Boolean emailAlert7Days, Boolean emailAlert3Days, Boolean emailAlert1Day) {
        this.emailAlert7Days = emailAlert7Days;
        this.emailAlert3Days = emailAlert3Days;
        this.emailAlert1Day = emailAlert1Day;
    }
}
