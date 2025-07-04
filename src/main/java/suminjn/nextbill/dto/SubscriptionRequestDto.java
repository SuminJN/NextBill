package suminjn.nextbill.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    private Long userId;
    private String name;
    private Integer cost;
    private BillingCycle billingCycle;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
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