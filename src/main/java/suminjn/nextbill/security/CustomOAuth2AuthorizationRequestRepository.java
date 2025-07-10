package suminjn.nextbill.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class CustomOAuth2AuthorizationRequestRepository implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {
    
    private static final String OAUTH2_AUTHORIZATION_REQUEST_ATTR_NAME = "oauth2_auth_request";
    private static final String STATE_COOKIE_NAME = "oauth2_auth_request_state";
    private static final int COOKIE_EXPIRE_SECONDS = 1800; // 30분
    
    // 메모리 기반 백업 저장소 (세션이 유실될 경우를 대비)
    private final ConcurrentHashMap<String, OAuth2AuthorizationRequest> requestCache = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    public CustomOAuth2AuthorizationRequestRepository() {
        // 30분마다 만료된 요청 정리
        scheduler.scheduleAtFixedRate(this::cleanupExpiredRequests, 30, 30, TimeUnit.MINUTES);
    }
    
    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        String stateParameter = request.getParameter("state");
        if (!StringUtils.hasText(stateParameter)) {
            log.debug("State parameter가 없습니다");
            return null;
        }
        
        // 1차: 세션에서 시도
        HttpSession session = request.getSession(false);
        if (session != null) {
            log.info("세션을 찾았습니다. Session ID: {}", session.getId());
            OAuth2AuthorizationRequest authorizationRequest = 
                (OAuth2AuthorizationRequest) session.getAttribute(OAUTH2_AUTHORIZATION_REQUEST_ATTR_NAME);
                
            if (authorizationRequest != null && stateParameter.equals(authorizationRequest.getState())) {
                log.info("세션에서 Authorization Request를 성공적으로 로드했습니다. State: {}", stateParameter);
                return authorizationRequest;
            }
        } else {
            log.warn("세션이 존재하지 않습니다. Request URI: {}", request.getRequestURI());
            log.warn("Cookie header: {}", request.getHeader("Cookie"));
        }
        
        // 2차: 메모리 캐시에서 시도
        OAuth2AuthorizationRequest cachedRequest = requestCache.get(stateParameter);
        if (cachedRequest != null) {
            log.info("메모리 캐시에서 Authorization Request를 로드했습니다. State: {}", stateParameter);
            return cachedRequest;
        }
        
        log.warn("Authorization Request를 찾을 수 없습니다. State: {}", stateParameter);
        return null;
    }
    
    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest, 
                                       HttpServletRequest request, 
                                       HttpServletResponse response) {
        if (authorizationRequest == null) {
            removeAuthorizationRequest(request, response);
            return;
        }
        
        String state = authorizationRequest.getState();
        
        // 1차: 세션에 저장
        HttpSession session = request.getSession(true);
        session.setAttribute(OAUTH2_AUTHORIZATION_REQUEST_ATTR_NAME, authorizationRequest);
        
        // 2차: 메모리 캐시에 백업 저장
        requestCache.put(state, authorizationRequest);
        
        // 3차: 쿠키에 state 저장 (디버깅 및 추적용)
        addStateCookie(response, state);
        
        log.info("Authorization Request를 저장했습니다. State: {}, Session ID: {}", 
                state, session.getId());
        log.info("세션 생성 시간: {}, 최대 비활성 간격: {}초", 
                session.getCreationTime(), session.getMaxInactiveInterval());
        
        // 응답 헤더에 세션 정보 확인을 위한 디버그 정보 추가
        response.setHeader("X-Session-Debug", "Session-ID=" + session.getId() + ";State=" + state);
    }
    
    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request, 
                                                               HttpServletResponse response) {
        String stateParameter = request.getParameter("state");
        OAuth2AuthorizationRequest authorizationRequest = loadAuthorizationRequest(request);
        
        if (authorizationRequest != null) {
            // 세션에서 제거
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.removeAttribute(OAUTH2_AUTHORIZATION_REQUEST_ATTR_NAME);
            }
            
            // 메모리 캐시에서 제거
            if (StringUtils.hasText(stateParameter)) {
                requestCache.remove(stateParameter);
            }
            
            // 쿠키 제거
            removeStateCookie(response);
            
            log.info("Authorization Request를 제거했습니다. State: {}", stateParameter);
        }
        
        return authorizationRequest;
    }
    
    private void addStateCookie(HttpServletResponse response, String state) {
        Cookie cookie = new Cookie(STATE_COOKIE_NAME, state);
        cookie.setPath("/");
        cookie.setMaxAge(COOKIE_EXPIRE_SECONDS);
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // HTTPS에서만 전송
        response.addCookie(cookie);
    }
    
    private void removeStateCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(STATE_COOKIE_NAME, "");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        response.addCookie(cookie);
    }
    
    private void cleanupExpiredRequests() {
        int sizeBefore = requestCache.size();
        if (sizeBefore > 100) { // 너무 많이 쌓이면 정리
            requestCache.clear();
            log.info("메모리 캐시를 정리했습니다. 이전 크기: {}", sizeBefore);
        }
    }
}
