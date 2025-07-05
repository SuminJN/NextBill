package suminjn.nextbill.dto;

import lombok.Builder;
import lombok.Data;
import suminjn.nextbill.domain.User;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponseDto {
    private Long userId;
    private String email;
    private Boolean isEmailAlertEnabled;
    private LocalDateTime createdAt;

    public static UserResponseDto from(User user) {
        return UserResponseDto.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .isEmailAlertEnabled(user.getIsEmailAlertEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
