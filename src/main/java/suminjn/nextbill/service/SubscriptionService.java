package suminjn.nextbill.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import suminjn.nextbill.domain.Subscription;
import suminjn.nextbill.dto.SubscriptionRequestDto;
import suminjn.nextbill.dto.SubscriptionResponseDto;
import suminjn.nextbill.repository.SubscriptionRepository;
import suminjn.nextbill.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public List<SubscriptionResponseDto> getSubscriptionsByUser(Long userId) {
        return subscriptionRepository.findByUser_UserId(userId).stream()
                .map(SubscriptionResponseDto::from)
                .collect(Collectors.toList());
    }

    public SubscriptionResponseDto createSubscription(SubscriptionRequestDto request) {
        Subscription sub = request.toEntity();
        sub.setUser(userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")));
        return SubscriptionResponseDto.from(subscriptionRepository.save(sub));
    }

    public SubscriptionResponseDto updateSubscription(Long id, SubscriptionRequestDto request) {
        Subscription sub = request.toEntity();
        sub.setSubscriptionId(id);
        sub.setUser(userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")));
        return SubscriptionResponseDto.from(subscriptionRepository.save(sub));
    }

    public void delete(Long id) {
        subscriptionRepository.deleteById(id);
    }

    public SubscriptionResponseDto togglePause(Long id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("구독을 찾을 수 없습니다."));
        sub.setIsPaused(!sub.getIsPaused());
        return SubscriptionResponseDto.from(subscriptionRepository.save(sub));
    }

    public Subscription findById(Long id) {
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("구독을 찾을 수 없습니다."));
    }

    public List<Subscription> findDueToday(LocalDate date) {
        return subscriptionRepository.findByIsPausedFalseAndNextPaymentDate(date);
    }

    public Subscription save(Subscription subscription) {
        return subscriptionRepository.save(subscription);
    }
}