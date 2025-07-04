// src/test/java/suminjn/nextbill/controller/SubscriptionControllerIntegrationTest.java
package suminjn.nextbill.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import suminjn.nextbill.domain.enums.BillingCycle;
import suminjn.nextbill.dto.SubscriptionRequestDto;
import suminjn.nextbill.dto.SubscriptionResponseDto;
import suminjn.nextbill.service.SubscriptionService;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Import(SubscriptionControllerTest.MockConfig.class)
@ExtendWith(SpringExtension.class)
class SubscriptionControllerTest {

    @TestConfiguration
    static class MockConfig {
        @Bean
        public SubscriptionService subscriptionService() {
            return Mockito.mock(SubscriptionService.class);
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SubscriptionService subscriptionService;

    @Test
    @DisplayName("구독 생성 통합 테스트")
    void createSubscription() throws Exception {
        SubscriptionRequestDto request = new SubscriptionRequestDto();
        request.setUserId(1L);
        request.setName("Netflix");
        request.setCost(12900);
        request.setBillingCycle(BillingCycle.MONTHLY);
        request.setNextPaymentDate(LocalDate.parse("2025-07-15"));

        SubscriptionResponseDto response = SubscriptionResponseDto.builder()
                .subscriptionId(1L)
                .userId(1L)
                .name("Netflix")
                .cost(12900)
                .billingCycle(BillingCycle.MONTHLY)
                .nextPaymentDate(LocalDate.parse("2025-07-15"))
                .isPaused(false)
                .build();

        Mockito.when(subscriptionService.createSubscription(any())).thenReturn(response);

        mockMvc.perform(post("/api/subscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.subscriptionId").value(1L))
                .andExpect(jsonPath("$.name").value("Netflix"));
    }

    @Test
    @DisplayName("사용자별 구독 목록 조회 통합 테스트")
    void getSubscriptionsByUser() throws Exception {
        SubscriptionResponseDto response = SubscriptionResponseDto.builder()
                .subscriptionId(1L)
                .userId(1L)
                .name("Netflix")
                .cost(12900)
                .billingCycle(BillingCycle.MONTHLY)
                .nextPaymentDate(LocalDate.parse("2025-07-15"))
                .isPaused(false)
                .build();

        Mockito.when(subscriptionService.getSubscriptionsByUser(1L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/subscriptions/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Netflix"));
    }

    @Test
    @DisplayName("구독 수정 통합 테스트")
    void updateSubscription() throws Exception {
        SubscriptionRequestDto request = new SubscriptionRequestDto();
        request.setUserId(1L);
        request.setName("Disney+");
        request.setCost(15000);
        request.setBillingCycle(BillingCycle.MONTHLY);
        request.setNextPaymentDate(LocalDate.parse("2025-08-01"));

        SubscriptionResponseDto response = SubscriptionResponseDto.builder()
                .subscriptionId(1L)
                .userId(1L)
                .name("Disney+")
                .cost(15000)
                .billingCycle(BillingCycle.MONTHLY)
                .nextPaymentDate(LocalDate.parse("2025-08-01"))
                .isPaused(false)
                .build();

        Mockito.when(subscriptionService.updateSubscription(eq(1L), any())).thenReturn(response);

        mockMvc.perform(put("/api/subscriptions/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Disney+"));
    }

    @Test
    @DisplayName("구독 삭제 통합 테스트")
    void deleteSubscription() throws Exception {
        Mockito.doNothing().when(subscriptionService).delete(1L);

        mockMvc.perform(delete("/api/subscriptions/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("구독 일시정지/재활성화 통합 테스트")
    void togglePause() throws Exception {
        SubscriptionResponseDto response = SubscriptionResponseDto.builder()
                .subscriptionId(1L)
                .userId(1L)
                .name("Netflix")
                .cost(12900)
                .billingCycle(BillingCycle.MONTHLY)
                .nextPaymentDate(LocalDate.parse("2025-07-15"))
                .isPaused(true)
                .build();

        Mockito.when(subscriptionService.togglePause(1L)).thenReturn(response);

        mockMvc.perform(patch("/api/subscriptions/1/pause"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isPaused").value(true));
    }
}