package suminjn.nextbill.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import suminjn.nextbill.domain.User;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEmailSettingsDto {
    private Boolean isEmailAlertEnabled;
    private Boolean emailAlert7Days;
    private Boolean emailAlert3Days;
    private Boolean emailAlert1Day;
    private Boolean emailAlertDDay;

    public static UserEmailSettingsDto from(User user) {
        return UserEmailSettingsDto.builder()
                .isEmailAlertEnabled(user.getIsEmailAlertEnabled())
                .emailAlert7Days(user.getEmailAlert7Days())
                .emailAlert3Days(user.getEmailAlert3Days())
                .emailAlert1Day(user.getEmailAlert1Day())
                .emailAlertDDay(user.getEmailAlertDDay())
                .build();
    }
}
