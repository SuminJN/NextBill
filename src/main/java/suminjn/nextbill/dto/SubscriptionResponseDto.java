package suminjn.nextbill.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import suminjn.nextbill.domain.enums.BillingCycle;
import suminjn.nextbill.domain.Subscription;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class SubscriptionResponseDto {

    private Long subscriptionId;
    private String name;
    private Integer cost;
    private BillingCycle billingCycle;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate nextPaymentDate;

    private Boolean isPaused;

    private Long userId;
    private String userEmail;

    public static SubscriptionResponseDto from(Subscription sub) {
        return SubscriptionResponseDto.builder()
                .subscriptionId(sub.getSubscriptionId())
                .name(sub.getName())
                .cost(sub.getCost())
                .billingCycle(sub.getBillingCycle())
                .startDate(sub.getStartDate())
                .nextPaymentDate(sub.getNextPaymentDate())
                .isPaused(sub.getIsPaused())
                .userId(sub.getUser().getUserId())
                .userEmail(sub.getUser().getEmail())
                .build();
    }
}