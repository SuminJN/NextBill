# 🚀 배포 가이드 종합 README

## 📋 NextBill 배포 옵션

NextBill을 프로덕션 환경에 배포하기 위한 완전한 가이드입니다. 다양한 클라우드 플랫폼과 배포 전략을 제공합니다.

---

## 🌟 권장 배포 플랫폼

### 1. **AWS EC2** (⭐⭐⭐⭐⭐)
- **최적 사용 사례**: 대규모 트래픽, 엔터프라이즈 환경
- **장점**: 완전한 제어권, 풍부한 서비스 생태계, 높은 안정성
- **예상 비용**: $20-50/월
- **가이드**: [AWS EC2 배포 가이드](./AWS_EC2_GUIDE.md)

### 2. **Google Cloud Platform** (⭐⭐⭐⭐⭐)
- **최적 사용 사례**: Google OAuth2 통합, 중간 규모 트래픽
- **장점**: Google 서비스 통합, 관리형 서비스, 무료 크레딧
- **예상 비용**: $30-60/월
- **가이드**: [GCP 배포 가이드](./GCP_GUIDE.md)

### 3. **DigitalOcean** (⭐⭐⭐⭐)
- **최적 사용 사례**: 스타트업, 중소규모 서비스
- **장점**: 간단한 설정, 고정 가격, 직관적 인터페이스
- **예상 비용**: $20-40/월
- **가이드**: [DigitalOcean 배포 가이드](./DIGITALOCEAN_GUIDE.md)

---

## 🎯 배포 전략 선택 가이드

### 사용자 규모별 추천

#### 🏠 개인/학습용 (< 100 사용자)
- **추천**: DigitalOcean Basic Droplet
- **사양**: 2GB RAM, 1 vCPU, 50GB SSD
- **비용**: ~$12/월

#### 🏢 스타트업/중소기업 (100-1,000 사용자)
- **추천**: AWS EC2 t3.medium 또는 GCP e2-medium
- **사양**: 4GB RAM, 2 vCPU, 80GB SSD
- **비용**: ~$30/월

#### 🏭 중견기업 (1,000-10,000 사용자)
- **추천**: AWS EC2 t3.large + RDS 또는 GCP with Load Balancer
- **사양**: 8GB RAM, 2 vCPU, 관리형 DB
- **비용**: ~$80/월

#### 🌐 대기업/고트래픽 (10,000+ 사용자)
- **추천**: AWS/GCP 다중 인스턴스 + 로드 밸런서
- **사양**: 다중 서버, 오토스케일링, CDN
- **비용**: $200+/월

---

## 🛠️ 배포 준비 체크리스트

### 1. 환경 설정
- [ ] Google OAuth2 클라이언트 ID/시크릿 생성
- [ ] Gmail App Password 생성
- [ ] 강력한 비밀번호 생성 (DB, Redis, JWT)
- [ ] 도메인 구매 (선택사항)

### 2. 서버 준비
- [ ] 클라우드 계정 생성 및 결제 설정
- [ ] SSH 키 생성 및 등록
- [ ] 서버 인스턴스 생성
- [ ] 방화벽 설정

### 3. 배포 실행
- [ ] 서버 접속 및 초기 설정
- [ ] Docker 설치
- [ ] 프로젝트 클론
- [ ] 환경 변수 설정
- [ ] 애플리케이션 실행

### 4. 운영 설정
- [ ] Nginx 프록시 설정
- [ ] SSL 인증서 설정
- [ ] 백업 스케줄 설정
- [ ] 모니터링 설정

---

## 🚦 단계별 배포 가이드

### Step 1: 플랫폼 선택
```bash
# 요구사항 분석
- 예상 사용자 수: ___명
- 월 예산: $_____
- 기술 수준: 초급/중급/고급
- 확장성 요구사항: 있음/없음

# 추천 플랫폼 결정
if 예상_사용자 < 1000 and 예산 < 50:
    추천 = "DigitalOcean"
elif Google_서비스_통합_중요:
    추천 = "Google Cloud Platform"
else:
    추천 = "AWS EC2"
```

### Step 2: 환경 변수 준비
```bash
# .env 파일 템플릿
cp .env.prod .env.local
nano .env.local

# 필수 환경 변수
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- NEXTBILL_EMAIL_USERNAME
- NEXTBILL_EMAIL_PASSWORD
- MYSQL_ROOT_PASSWORD
- MYSQL_PASSWORD
- REDIS_PASSWORD
- JWT_SECRET
```

### Step 3: 배포 실행
```bash
# 선택한 플랫폼의 가이드 따라하기
# 예: AWS EC2
1. AWS 계정 생성
2. EC2 인스턴스 생성
3. SSH 접속
4. 환경 설정 스크립트 실행
5. 애플리케이션 배포
```

### Step 4: 검증 및 모니터링
```bash
# 배포 후 확인사항
- 웹사이트 접속 확인
- API 엔드포인트 테스트
- Google OAuth2 로그인 테스트
- 이메일 알림 테스트
- 성능 모니터링 설정
```

---

## 🔧 CI/CD 자동화

### GitHub Actions 설정
```bash
# 자동 배포 파이프라인 설정
1. GitHub Secrets 설정
2. 워크플로우 파일 확인
3. 자동 배포 테스트
4. 모니터링 및 알림 설정

# 자세한 가이드
➡️ [CI/CD 가이드](./CICD_GUIDE.md)
```

### 배포 전략
- **기본 배포**: 단순하고 직접적인 배포
- **블루-그린 배포**: 무중단 배포 (고급)
- **카나리 배포**: 단계적 배포 (고급)
- **롤링 배포**: 점진적 업데이트 (고급)

---

## 💰 비용 최적화

### 클라우드 비용 비교

| 플랫폼 | 기본 구성 | 확장 구성 | 특징 |
|--------|-----------|-----------|------|
| **AWS EC2** | $20-30/월 | $50-100/월 | 종량제, 다양한 옵션 |
| **GCP** | $25-35/월 | $60-120/월 | 무료 크레딧, Google 통합 |
| **DigitalOcean** | $20-25/월 | $40-80/월 | 고정 가격, 예측 가능 |

### 비용 절약 팁
- **리소스 모니터링**: 불필요한 리소스 제거
- **예약 인스턴스**: 장기 사용 시 할인
- **스팟 인스턴스**: 비용 절약 (AWS)
- **자동 스케일링**: 수요에 따른 자동 조정

---

## 🛡️ 보안 설정

### 필수 보안 조치
```bash
# 1. 방화벽 설정
- SSH (22): 특정 IP만 허용
- HTTP (80): 모든 IP 허용
- HTTPS (443): 모든 IP 허용

# 2. SSL 인증서
- Let's Encrypt 무료 SSL
- 자동 갱신 설정

# 3. 비밀번호 정책
- 16자 이상 복잡한 비밀번호
- 정기적인 변경
- 2FA 활성화 (클라우드 계정)

# 4. 정기 업데이트
- 시스템 패키지 업데이트
- Docker 이미지 업데이트
- 의존성 라이브러리 업데이트
```

### 보안 모니터링
- **침입 탐지**: fail2ban, rkhunter
- **로그 분석**: 정기적인 로그 검토
- **취약점 스캔**: 정기적인 보안 점검

---

## 📊 모니터링 및 알림

### 핵심 지표
- **가용성**: 99.9% 이상 목표
- **응답 시간**: 500ms 이하
- **CPU 사용률**: 80% 이하
- **메모리 사용률**: 85% 이하
- **디스크 사용률**: 85% 이하

### 알림 채널
- **이메일**: 즉시 알림
- **Slack**: 팀 협업
- **SMS**: 긴급 상황
- **Discord**: 커뮤니티

---

## 🆘 문제 해결

### 일반적인 문제들

#### 1. 애플리케이션 시작 실패
```bash
# 로그 확인
docker-compose logs -f nextbill-app

# 환경 변수 확인
docker-compose config

# 포트 충돌 확인
sudo netstat -tlnp | grep :8080
```

#### 2. 데이터베이스 연결 오류
```bash
# MySQL 컨테이너 상태 확인
docker-compose ps mysql

# 데이터베이스 로그 확인
docker-compose logs mysql

# 연결 테스트
docker exec -it nextbill-mysql mysql -u root -p
```

#### 3. OAuth2 인증 실패
```bash
# Google Cloud Console에서 확인
- 클라이언트 ID 정확성
- 리디렉션 URI 설정
- 도메인 승인 상태

# 애플리케이션 로그 확인
docker-compose logs nextbill-app | grep -i oauth
```

#### 4. 이메일 발송 실패
```bash
# Gmail 설정 확인
- 2단계 인증 활성화
- 앱 비밀번호 생성
- SMTP 설정 확인

# 이메일 로그 확인
docker-compose logs nextbill-app | grep -i email
```

---

## 📈 성능 최적화

### 백엔드 최적화
- **데이터베이스 인덱스**: 쿼리 성능 향상
- **연결 풀**: 데이터베이스 연결 최적화
- **캐싱**: Redis 활용한 응답 시간 단축
- **비동기 처리**: 이메일 발송 비동기화

### 프론트엔드 최적화
- **코드 스플리팅**: 필요한 부분만 로드
- **이미지 최적화**: WebP 포맷 사용
- **CDN**: 정적 파일 전송 속도 향상
- **PWA**: 오프라인 지원 및 성능 향상

### 인프라 최적화
- **로드 밸런싱**: 트래픽 분산
- **오토 스케일링**: 수요에 따른 자동 확장
- **CDN**: 글로벌 콘텐츠 전송
- **모니터링**: 성능 지표 추적

---

## 🎉 배포 성공 후 할 일

### 1. 기본 검증
- [ ] 모든 페이지 접속 확인
- [ ] 회원가입/로그인 테스트
- [ ] 구독 관리 기능 테스트
- [ ] 이메일 알림 테스트

### 2. 성능 테스트
- [ ] 로드 테스트 실행
- [ ] 동시 접속자 테스트
- [ ] 응답 시간 측정

### 3. 보안 검사
- [ ] 취약점 스캔 실행
- [ ] SSL 인증서 확인
- [ ] 방화벽 규칙 검토

### 4. 운영 준비
- [ ] 백업 스케줄 확인
- [ ] 모니터링 대시보드 설정
- [ ] 알림 채널 테스트
- [ ] 장애 대응 계획 수립

---

## 📚 추가 자료

### 공식 문서
- [Spring Boot 배포 가이드](https://spring.io/guides/gs/spring-boot-docker/)
- [Docker 프로덕션 가이드](https://docs.docker.com/config/containers/start-containers-automatically/)
- [Nginx 설정 가이드](https://nginx.org/en/docs/beginners_guide.html)

### 커뮤니티 리소스
- [AWS 커뮤니티](https://aws.amazon.com/ko/developer/community/)
- [GCP 커뮤니티](https://cloud.google.com/community)
- [DigitalOcean 커뮤니티](https://www.digitalocean.com/community)

### 도구 및 서비스
- [Uptime Robot](https://uptimerobot.com/): 무료 모니터링
- [Cloudflare](https://cloudflare.com/): 무료 CDN 및 보안
- [Let's Encrypt](https://letsencrypt.org/): 무료 SSL 인증서

---

## 📞 지원 및 문의

### 프로젝트 지원
- **GitHub Issues**: [NextBill Issues](https://github.com/suminjn/NextBill/issues)
- **이메일**: nextbill.kr@gmail.com, wjstnals1211@gmail.com
- **문서**: 각 가이드의 문제 해결 섹션 참조

### 긴급 상황 대응
1. **서비스 장애**: 즉시 모니터링 로그 확인
2. **보안 문제**: 서비스 일시 중단 후 조치
3. **데이터 손실**: 백업에서 복구
4. **성능 저하**: 리소스 모니터링 및 확장

---

## 🏆 성공적인 배포를 위한 마지막 조언

1. **천천히 단계별로**: 각 단계를 완료한 후 다음 단계로
2. **로그 확인 습관화**: 문제 발생 시 항상 로그 먼저 확인
3. **정기적인 백업**: 데이터 손실 방지
4. **보안 업데이트**: 정기적인 시스템 업데이트
5. **모니터링 설정**: 문제 조기 발견 및 대응

**🎯 NextBill을 성공적으로 배포하여 안정적인 서비스를 제공하세요!**

---

## 📝 체크리스트 요약

### 🔍 배포 전 (Pre-deployment)
- [ ] 플랫폼 선택 완료
- [ ] 환경 변수 설정 완료
- [ ] Google OAuth2 설정 완료
- [ ] 도메인 준비 (선택사항)

### 🚀 배포 진행 (Deployment)
- [ ] 서버 인스턴스 생성
- [ ] SSH 접속 확인
- [ ] Docker 설치 완료
- [ ] 애플리케이션 배포 완료

### ✅ 배포 후 (Post-deployment)
- [ ] 웹사이트 접속 확인
- [ ] 기능 테스트 완료
- [ ] SSL 인증서 설정
- [ ] 모니터링 설정 완료
- [ ] 백업 스케줄 설정

**모든 체크리스트 완료 시 NextBill 배포 성공! 🎉**
