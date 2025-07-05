package suminjn.nextbill.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "유효한 이메일 형식이 아닙니다")
    private String email;
    
    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 4, max = 20, message = "비밀번호는 4자 이상 20자 이하여야 합니다")
    private String password;
    
    @NotNull(message = "이메일 알림 수신 여부는 필수입니다")
    private Boolean isEmailAlertEnabled;

    public User toEntity() {
        return User.builder()
                .email(this.email)
                .password(this.password)
                .isEmailAlertEnabled(this.isEmailAlertEnabled)
                .build();
    }
}