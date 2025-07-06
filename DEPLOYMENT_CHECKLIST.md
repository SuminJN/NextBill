# 🚀 NextBill 배포 체크리스트

## 📋 배포 전 준비사항

### 1. 환경 변수 설정
- [ ] `.env.prod` 파일의 모든 값 설정
- [ ] 데이터베이스 비밀번호 설정
- [ ] Redis 비밀번호 설정
- [ ] JWT 시크릿 키 생성 (256비트 이상)
- [ ] Google OAuth2 클라이언트 ID/시크릿 설정
- [ ] 이메일 SMTP 설정 (Gmail App Password)

### 2. Google OAuth2 설정
- [ ] Google Cloud Console에서 OAuth2 클라이언트 생성
- [ ] 승인된 리디렉션 URI 추가:
  - `https://yourdomain.com/oauth2/callback/google`
  - `https://yourdomain.com/api/auth/oauth2/callback/google`
- [ ] 승인된 JavaScript 오리진 추가:
  - `https://yourdomain.com`

### 3. 이메일 설정
- [ ] Gmail App Password 생성 (Gmail 계정 설정 → 보안 → 앱 비밀번호)
- [ ] SMTP 설정 확인

### 4. 도메인 및 SSL
- [ ] 도메인 구매 (선택사항)
- [ ] DNS 설정 (A 레코드를 서버 IP로 연결)
- [ ] SSL 인증서 설정 (Let's Encrypt 권장)

### 5. 서버 요구사항
- [ ] **최소 사양**: 2GB RAM, 1 CPU, 20GB 저장공간
- [ ] **권장 사양**: 4GB RAM, 2 CPU, 40GB 저장공간
- [ ] Docker 및 Docker Compose 설치
- [ ] 포트 개방: 80, 443, 22 (SSH)

---

## 🔧 배포 단계

### 1단계: 서버 설정
```bash
# 서버 업데이트
sudo apt update && sudo apt upgrade -y

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER
```

### 2단계: 프로젝트 클론 및 설정
```bash
# 프로젝트 클론
git clone https://github.com/suminjn/NextBill.git
cd NextBill

# 환경 변수 설정
cp .env.prod .env
nano .env  # 환경 변수 값 설정

# 권한 설정
chmod 755 gradlew
```

### 3단계: 배포 실행
```bash
# 프로덕션 환경 빌드 및 실행
docker-compose -f docker-compose.prod.yml up -d

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f
```

### 4단계: SSL 인증서 설정 (Let's Encrypt)
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com

# 자동 갱신 설정
sudo crontab -e
# 다음 줄 추가: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 5단계: 모니터링 및 로그 확인
```bash
# 서비스 상태 확인
docker-compose -f docker-compose.prod.yml ps

# 애플리케이션 로그 확인
docker-compose -f docker-compose.prod.yml logs nextbill-app

# 시스템 리소스 모니터링
docker stats
```

---

## 🔒 보안 설정

### 1. 방화벽 설정
```bash
# UFW 설치 및 설정
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw reload
```

### 2. 정기 백업 설정
```bash
# 데이터베이스 백업 스크립트 생성
mkdir -p ~/backups
nano ~/backup_db.sh
```

### 3. 모니터링 도구 설정
- **Prometheus + Grafana**: 시스템 모니터링
- **ELK Stack**: 로그 분석
- **Uptime Robot**: 서비스 가용성 모니터링

---

## 📈 성능 최적화

### 1. 캐싱 전략
- [ ] Redis 캐시 설정 확인
- [ ] 정적 파일 CDN 연결 고려

### 2. 데이터베이스 최적화
- [ ] 인덱스 최적화
- [ ] 정기적인 데이터베이스 정리

### 3. 로드 밸런싱 (선택사항)
- [ ] Nginx 로드 밸런서 설정
- [ ] 다중 인스턴스 배포

---

## 🚨 장애 대응

### 1. 모니터링 및 알림
- [ ] 서비스 상태 모니터링
- [ ] 이메일/SMS 알림 설정
- [ ] 로그 분석 시스템

### 2. 백업 및 복원
- [ ] 정기 백업 스케줄
- [ ] 복원 절차 문서화
- [ ] 재해 복구 계획

### 3. 업데이트 전략
- [ ] 블루-그린 배포 전략
- [ ] 롤백 계획
- [ ] 카나리 배포 고려

---

## 🎯 다음 단계

### 단기 목표
- [ ] 기본 배포 완료
- [ ] SSL 인증서 설정
- [ ] 모니터링 시스템 구축

### 중기 목표
- [ ] CI/CD 파이프라인 구축
- [ ] 자동 백업 시스템
- [ ] 성능 모니터링 대시보드

### 장기 목표
- [ ] 다중 지역 배포
- [ ] 로드 밸런싱
- [ ] 재해 복구 시스템

---

## 📞 배포 지원

배포 과정에서 문제가 발생하면 다음을 확인하세요:

1. **로그 확인**: `docker-compose logs -f`
2. **포트 확인**: `netstat -tlnp | grep :8080`
3. **환경 변수 확인**: `docker-compose config`
4. **서비스 상태 확인**: `docker-compose ps`

**도움이 필요하면 언제든지 연락하세요!**
