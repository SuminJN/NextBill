package suminjn.nextbill.dto;

import lombok.Builder;
import lombok.Data;
import suminjn.nextbill.domain.User;

@Data
@Builder
public class UserResponseDto {
    private Long userId;
    private String userEmail;
    private Boolean isEmailAlertEnabled;

    public static UserResponseDto from(User user) {
        return UserResponseDto.builder()
                .userId(user.getUserId())
                .userEmail(user.getEmail())
                .isEmailAlertEnabled(user.getIsEmailAlertEnabled())
                .build();
    }
}
