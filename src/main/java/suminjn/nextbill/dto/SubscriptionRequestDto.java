package suminjn.nextbill.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import suminjn.nextbill.domain.enums.BillingCycle;
import suminjn.nextbill.domain.Subscription;
import suminjn.nextbill.domain.User;
import lombok.Data;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionRequestDto {
    @NotNull(message = "사용자 ID는 필수입니다")
    private Long userId;
    
    @NotBlank(message = "서비스명은 필수입니다")
    @Size(max = 100, message = "서비스명은 100자 이하여야 합니다")
    private String name;
    
    @NotNull(message = "금액은 필수입니다")
    @Positive(message = "금액은 양수여야 합니다")
    private Integer cost;
    
    @NotNull(message = "결제 주기는 필수입니다")
    private BillingCycle billingCycle;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @NotNull(message = "다음 결제일은 필수입니다")
    @Future(message = "다음 결제일은 미래 날짜여야 합니다")
    private LocalDate nextPaymentDate;

    private Boolean isPaused;

    public Subscription toEntity() {
        return Subscription.builder()
                .user(User.builder().userId(userId).build())
                .name(name)
                .cost(cost)
                .billingCycle(billingCycle)
                .startDate(startDate)
                .nextPaymentDate(nextPaymentDate)
                .isPaused(isPaused != null ? isPaused : false)
                .build();
    }
}