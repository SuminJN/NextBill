package suminjn.nextbill.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequestDto {
    private String userEmail;
    
    @NotBlank(message = "리프레시 토큰은 필수입니다")
    private String refreshToken;
}