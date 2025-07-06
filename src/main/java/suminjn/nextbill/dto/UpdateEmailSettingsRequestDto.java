package suminjn.nextbill.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateEmailSettingsRequestDto {
    private Boolean isEmailAlertEnabled;
    private Boolean emailAlert7Days;
    private Boolean emailAlert3Days;
    private Boolean emailAlert1Day;
    private Boolean emailAlertDDay;
}
