package suminjn.nextbill.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final StringRedisTemplate redisTemplate;

    private static final String PREFIX = "refresh:";
    private static final Duration TTL = Duration.ofDays(14);

    public void save(String email, String refreshToken) {
        redisTemplate.opsForValue().set(PREFIX + email, refreshToken, TTL);
    }

    public boolean isValid(String email, String refreshToken) {
        String stored = redisTemplate.opsForValue().get(PREFIX + email);
        return stored != null && stored.equals(refreshToken);
    }

    public void delete(String email) {
        redisTemplate.delete(PREFIX + email);
    }
}
