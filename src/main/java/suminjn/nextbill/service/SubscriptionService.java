package suminjn.nextbill.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import suminjn.nextbill.domain.Subscription;
import suminjn.nextbill.dto.SubscriptionRequestDto;
import suminjn.nextbill.dto.SubscriptionResponseDto;
import suminjn.nextbill.exception.EntityNotFoundException;
import suminjn.nextbill.repository.SubscriptionRepository;
import suminjn.nextbill.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
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
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. ID: " + request.getUserId())));
        return SubscriptionResponseDto.from(subscriptionRepository.save(sub));
    }

    public SubscriptionResponseDto updateSubscription(Long id, SubscriptionRequestDto request) {
        Subscription existingSub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("구독을 찾을 수 없습니다. ID: " + id));
        
        existingSub.updateDetails(
                request.getName(),
                request.getCost(),
                request.getBillingCycle(),
                request.getNextPaymentDate()
        );
        
        log.info("구독 정보 수정 완료. ID: {}", id);
        return SubscriptionResponseDto.from(subscriptionRepository.save(existingSub));
    }

    public void delete(Long id) {
        if (!subscriptionRepository.existsById(id)) {
            throw new EntityNotFoundException("구독을 찾을 수 없습니다. ID: " + id);
        }
        subscriptionRepository.deleteById(id);
        log.info("구독 삭제 완료. ID: {}", id);
    }

    public SubscriptionResponseDto togglePause(Long id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("구독을 찾을 수 없습니다. ID: " + id));
        
        if (sub.getIsPaused()) {
            sub.resume();
            log.info("구독 재활성화. ID: {}", id);
        } else {
            sub.pause();
            log.info("구독 일시정지. ID: {}", id);
        }
        
        return SubscriptionResponseDto.from(subscriptionRepository.save(sub));
    }

    public Subscription findById(Long id) {
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("구독을 찾을 수 없습니다. ID: " + id));
    }

    public List<Subscription> findDueToday(LocalDate date) {
        return subscriptionRepository.findByIsPausedFalseAndNextPaymentDateWithUser(date);
    }

    public List<Subscription> findOverdueSubscriptions(LocalDate today) {
        return subscriptionRepository.findOverdueSubscriptionsWithUser(today);
    }

    public Subscription save(Subscription subscription) {
        return subscriptionRepository.save(subscription);
    }
}