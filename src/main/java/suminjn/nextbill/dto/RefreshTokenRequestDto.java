package suminjn.nextbill.dto;

import lombok.Data;

@Data
public class RefreshTokenRequestDto {
    private String userEmail;
    private String refreshToken;
}