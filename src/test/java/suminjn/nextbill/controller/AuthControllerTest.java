package suminjn.nextbill.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import suminjn.nextbill.dto.LoginRequestDto;
import suminjn.nextbill.dto.LoginResponseDto;
import suminjn.nextbill.dto.RefreshTokenRequestDto;
import suminjn.nextbill.security.JwtProvider;
import suminjn.nextbill.service.AuthService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Import(AuthControllerTest.MockConfig.class)
class AuthControllerTest {

    @TestConfiguration
    static class MockConfig {
        @Bean
        public AuthService authService() {
            return Mockito.mock(AuthService.class);
        }
        @Bean
        public JwtProvider jwtProvider() {
            return Mockito.mock(JwtProvider.class);
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtProvider jwtProvider;

    // 기존 이메일/비밀번호 로그인 테스트 제거 - Google OAuth2만 사용
    /*
    @Test
    @DisplayName("로그인 성공 테스트")
    void login() throws Exception {
        LoginRequestDto request = new LoginRequestDto();
        request.setUserEmail("test@email.com");
        request.setUserPassword("password");

        LoginResponseDto response = LoginResponseDto.builder()
                .accessToken("access-token")
                .refreshToken("refresh-token")
                .build();

        Mockito.when(authService.login(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"));
    }
    */

    @Test
    @DisplayName("토큰 재발급 성공 테스트")
    void refresh() throws Exception {
        RefreshTokenRequestDto request = new RefreshTokenRequestDto();
        request.setRefreshToken("refresh-token");

        LoginResponseDto response = LoginResponseDto.builder()
                .accessToken("new-access-token")
                .refreshToken("new-refresh-token")
                .build();

        Mockito.when(authService.refreshToken(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"))
                .andExpect(jsonPath("$.refreshToken").value("new-refresh-token"));
    }

    @Test
    @DisplayName("로그아웃 성공 테스트")
    void logout() throws Exception {
        String token = "access-token";
        Mockito.when(jwtProvider.validateToken(token)).thenReturn(true);
        Mockito.when(jwtProvider.getEmailFromToken(token)).thenReturn("test@email.com");
        Mockito.doNothing().when(authService).logout(eq("test@email.com"));

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }
}