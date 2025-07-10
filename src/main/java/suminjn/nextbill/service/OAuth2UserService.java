package suminjn.nextbill.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import suminjn.nextbill.domain.User;
import suminjn.nextbill.repository.UserRepository;
import suminjn.nextbill.security.OAuth2UserInfo;
import suminjn.nextbill.security.OAuth2UserPrincipal;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        log.info("OAuth2UserService.loadUser 호출됨");
        
        OAuth2User oAuth2User = super.loadUser(userRequest);
        log.info("Google에서 사용자 정보 수신 완료: {}", oAuth2User.getAttributes());
        
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails()
                .getUserInfoEndpoint()
                .getUserNameAttributeName();
        
        log.info("Registration ID: {}, UserNameAttribute: {}", registrationId, userNameAttributeName);

        OAuth2UserInfo userInfo = OAuth2UserInfo.of(registrationId, oAuth2User.getAttributes());
        log.info("OAuth2UserInfo 생성 완료 - 이메일: {}", userInfo.getEmail());
        
        User user = saveOrUpdate(userInfo);
        log.info("사용자 저장/업데이트 완료 - ID: {}", user.getUserId());
        
        return new OAuth2UserPrincipal(user, oAuth2User.getAttributes(), userNameAttributeName);
    }

    private User saveOrUpdate(OAuth2UserInfo userInfo) {
        User existingUser = userRepository.findByEmail(userInfo.getEmail());
        
        if (existingUser != null) {
            // 기존 사용자 정보 업데이트
            log.info("기존 사용자 로그인: {}", userInfo.getEmail());
            return existingUser;
        } else {
            // 새 사용자 생성
            User newUser = User.builder()
                    .email(userInfo.getEmail())
                    .password("") // OAuth2 사용자는 비밀번호 불필요
                    .isEmailAlertEnabled(true) // 기본값으로 이메일 알림 활성화
                    .emailAlert7Days(true)
                    .emailAlert3Days(true)
                    .emailAlert1Day(true)
                    .build();
            
            User savedUser = userRepository.save(newUser);
            log.info("새 사용자 생성: {}", userInfo.getEmail());
            return savedUser;
        }
    }
}
