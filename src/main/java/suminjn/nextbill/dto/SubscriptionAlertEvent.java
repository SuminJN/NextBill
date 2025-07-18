package suminjn.nextbill.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import suminjn.nextbill.domain.enums.AlertType;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionAlertEvent {

    private Long subscriptionId;
    private String userEmail;
    private String serviceName;
    private AlertType alertType;
    private String alertTypeDisplay; // 사용자 친화적 표시용

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate alertDate;
}
