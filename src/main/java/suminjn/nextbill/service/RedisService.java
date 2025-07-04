package suminjn.nextbill.service;

import suminjn.nextbill.dto.SubscriptionAlertEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisService {

    private final StringRedisTemplate redisTemplate;

    public boolean isAlreadySent(SubscriptionAlertEvent event) {
        String key = buildKey(event);
        Boolean exists = redisTemplate.hasKey(key);
        return exists != null && exists;
    }

    public void markAsSent(SubscriptionAlertEvent event) {
        String key = buildKey(event);
        redisTemplate.opsForValue().set(key, "sent", Duration.ofDays(2));
        log.debug("✅ Redis 캐시 저장 완료: {}", key);
    }

    private String buildKey(SubscriptionAlertEvent event) {
        return String.format("alert:%d:%s:%s",
                event.getSubscriptionId(),
                event.getAlertType().name(),
                event.getAlertDate());
    }
}
