package suminjn.nextbill.dto;

import lombok.Data;
import suminjn.nextbill.domain.User;

@Data
public class UserRequestDto {
    private String userEmail;
    private String userPassword;
    private Boolean isEmailAlertEnabled;

    public User toEntity() {
        return User.builder()
                .email(userEmail)
                .password(userPassword)
                .isEmailAlertEnabled(isEmailAlertEnabled != null ? isEmailAlertEnabled : true)
                .build();
    }
}