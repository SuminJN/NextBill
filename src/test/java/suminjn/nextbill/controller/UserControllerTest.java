package suminjn.nextbill.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import suminjn.nextbill.dto.UserRequestDto;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    @DisplayName("회원가입 성공")
    void register_success() throws Exception {
        UserRequestDto request = new UserRequestDto();
        request.setEmail("test1@example.com");
        request.setPassword("1234");
        request.setIsEmailAlertEnabled(true);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test1@example.com"));
    }

        @Test
        @DisplayName("중복 이메일 회원가입 실패")
        void register_fail_duplicateEmail() throws Exception {
            String email = "duplicate@example.com";

            UserRequestDto first = new UserRequestDto();
            first.setEmail(email);
            first.setPassword("1234");
            first.setIsEmailAlertEnabled(true);

            mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(first)))
                    .andExpect(status().isOk());

            UserRequestDto second = new UserRequestDto();
            second.setEmail(email);
            second.setPassword("1234");
            second.setIsEmailAlertEnabled(false);

            mockMvc.perform(post("/api/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(second)))
                    .andExpect(status().isBadRequest());
        }

    @Test
    @DisplayName("이메일 중복 확인")
    void checkEmailExists() throws Exception {
        String email = "exists@example.com";

        UserRequestDto request = new UserRequestDto();
        request.setEmail(email);
        request.setPassword("1234");
        request.setIsEmailAlertEnabled(true);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/users/exists")
                        .param("email", email))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }
}
