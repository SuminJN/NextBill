package suminjn.nextbill.controller;

import jakarta.validation.Valid;
import suminjn.nextbill.dto.SubscriptionRequestDto;
import suminjn.nextbill.dto.SubscriptionResponseDto;
import suminjn.nextbill.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    // 사용자 ID 기준으로 구독 목록 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SubscriptionResponseDto>> getSubscriptionsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionsByUser(userId));
    }

    // 구독 등록
    @PostMapping
    public ResponseEntity<SubscriptionResponseDto> createSubscription(@Valid @RequestBody SubscriptionRequestDto request) {
        SubscriptionResponseDto response = subscriptionService.createSubscription(request);
        return ResponseEntity.created(URI.create("/api/subscriptions/" + response.getSubscriptionId())).body(response);
    }

    // 구독 수정
    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionResponseDto> updateSubscription(@PathVariable Long id, @Valid @RequestBody SubscriptionRequestDto request) {
        SubscriptionResponseDto response = subscriptionService.updateSubscription(id, request);
        return ResponseEntity.ok(response);
    }

    // 구독 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable Long id) {
        subscriptionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // 구독 일시 정지 / 재활성화
    @PatchMapping("/{id}/pause")
    public ResponseEntity<SubscriptionResponseDto> togglePause(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.togglePause(id));
    }
}