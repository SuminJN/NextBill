package suminjn.nextbill.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import suminjn.nextbill.domain.User;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequestDto {
    private String email;
    private String password;
    private Boolean isEmailAlertEnabled;

    public User toEntity() {
        return User.builder()
                .email(this.email)
                .password(this.password)
                .isEmailAlertEnabled(this.isEmailAlertEnabled)
                .build();
    }
}