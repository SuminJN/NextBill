# 🚀 AWS EC2 배포 가이드

## 📋 AWS EC2를 사용한 NextBill 배포

AWS EC2는 가장 인기 있고 안정적인 클라우드 플랫폼으로, NextBill 프로덕션 배포에 최적입니다.

---

## 1. AWS EC2 인스턴스 생성

### 1.1 AWS 콘솔 접속
1. [AWS 콘솔](https://aws.amazon.com/console/)에 로그인
2. EC2 서비스로 이동
3. "Launch Instance" 클릭

### 1.2 인스턴스 설정
```
Name: NextBill-Production
Application and OS Images: Ubuntu Server 22.04 LTS
Instance Type: t3.medium (추천) 또는 t2.micro (테스트용)
Key Pair: 새로 생성하거나 기존 키 선택
Network Settings:
  - VPC: Default VPC
  - Subnet: 기본값
  - Auto-assign Public IP: Enable
  - Security Group: NextBill-SG (새로 생성)
Storage: 30 GB gp3 (추천)
```

### 1.3 보안 그룹 설정
```
Security Group Name: NextBill-SG
Inbound Rules:
  - SSH (22): Your IP
  - HTTP (80): Anywhere (0.0.0.0/0)
  - HTTPS (443): Anywhere (0.0.0.0/0)
  - Custom TCP (8080): Anywhere (테스트용, 나중에 제거)
```

---

## 2. 서버 초기 설정

### 2.1 SSH 접속
```bash
# 키 파일 권한 설정
chmod 400 your-key.pem

# EC2 인스턴스 접속
ssh -i your-key.pem ubuntu@your-instance-public-ip
```

### 2.2 시스템 업데이트 및 Docker 설치
```bash
#!/bin/bash

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y curl wget git unzip

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 재로그인을 위해 현재 세션 종료
exit
```

### 2.3 다시 접속하여 Docker 확인
```bash
ssh -i your-key.pem ubuntu@your-instance-public-ip

# Docker 버전 확인
docker --version
docker-compose --version
```

---

## 3. 애플리케이션 배포

### 3.1 프로젝트 클론
```bash
# 프로젝트 클론
git clone https://github.com/suminjn/NextBill.git
cd NextBill

# 실행 권한 부여
chmod +x gradlew
```

### 3.2 환경 변수 설정
```bash
# 환경 변수 파일 복사 및 편집
cp .env.prod .env
nano .env
```

**중요한 환경 변수들:**
```bash
# 강력한 비밀번호 설정
MYSQL_ROOT_PASSWORD=your-super-strong-root-password-123!
MYSQL_PASSWORD=your-super-strong-mysql-password-456!
REDIS_PASSWORD=your-super-strong-redis-password-789!

# JWT 시크릿 (256비트 이상)
JWT_SECRET=your-super-secret-jwt-key-must-be-at-least-256-bits-long-abcdef123456

# Google OAuth2 (Google Cloud Console에서 생성)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 이메일 설정 (Gmail App Password)
NEXTBILL_EMAIL_USERNAME=your-email@gmail.com
NEXTBILL_EMAIL_PASSWORD=your-gmail-app-password

# 도메인 설정 (옵션)
DOMAIN=your-domain.com
```

### 3.3 배포 실행
```bash
# 프로덕션 환경으로 빌드 및 실행
docker-compose -f docker-compose.prod.yml up -d

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f
```

### 3.4 서비스 상태 확인
```bash
# 컨테이너 상태 확인
docker-compose -f docker-compose.prod.yml ps

# 애플리케이션 접속 테스트
curl http://localhost:8080/api/health

# 웹 브라우저에서 접속 테스트
# http://your-instance-public-ip:8080
```

---

## 4. Nginx 및 SSL 설정

### 4.1 Nginx 설치
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4.2 Nginx 설정
```bash
# 기존 기본 설정 제거
sudo rm /etc/nginx/sites-enabled/default

# NextBill 설정 파일 생성
sudo nano /etc/nginx/sites-available/nextbill
```

**Nginx 설정 내용:**
```nginx
server {
    listen 80;
    server_name your-domain.com your-instance-public-ip;

    # 정적 파일 서빙
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API 프록시
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # OAuth2 콜백
    location /oauth2/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 설정 활성화
sudo ln -s /etc/nginx/sites-available/nextbill /etc/nginx/sites-enabled/

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

### 4.3 SSL 인증서 설정 (Let's Encrypt)
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# 도메인이 있는 경우
sudo certbot --nginx -d your-domain.com

# IP만 사용하는 경우 (테스트용)
# SSL 없이 HTTP로만 사용
```

### 4.4 자동 SSL 갱신 설정
```bash
# 갱신 테스트
sudo certbot renew --dry-run

# 자동 갱신 설정
sudo crontab -e
# 다음 줄 추가:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 5. 방화벽 및 보안 설정

### 5.1 UFW 방화벽 설정
```bash
# UFW 활성화
sudo ufw enable

# 기본 정책 설정
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 필요한 포트 허용
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# 방화벽 상태 확인
sudo ufw status
```

### 5.2 SSH 보안 강화
```bash
# SSH 설정 편집
sudo nano /etc/ssh/sshd_config

# 다음 설정 추가/수정:
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes
# Port 22 (기본값 또는 다른 포트로 변경)

# SSH 서비스 재시작
sudo systemctl restart ssh
```

---

## 6. 모니터링 및 백업

### 6.1 시스템 모니터링
```bash
# htop 설치 (시스템 모니터링)
sudo apt install htop -y

# 시스템 리소스 확인
htop
df -h
free -m
docker stats
```

### 6.2 로그 모니터링
```bash
# 애플리케이션 로그
docker-compose -f docker-compose.prod.yml logs -f nextbill-app

# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 시스템 로그
sudo journalctl -f
```

### 6.3 자동 백업 설정
```bash
# 백업 디렉토리 생성
mkdir -p ~/backups

# 백업 스크립트 생성
nano ~/backup_script.sh
```

**백업 스크립트 내용:**
```bash
#!/bin/bash

# 설정
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
MYSQL_CONTAINER="nextbill-mysql"
MYSQL_PASSWORD="your-mysql-password"

# 데이터베이스 백업
docker exec $MYSQL_CONTAINER mysqldump -u root -p$MYSQL_PASSWORD nextbill > $BACKUP_DIR/nextbill_db_$DATE.sql

# 환경 변수 백업
cp ~/NextBill/.env $BACKUP_DIR/env_$DATE.backup

# 7일 이상 된 백업 파일 삭제
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# 실행 권한 부여
chmod +x ~/backup_script.sh

# 크론탭에 백업 스케줄 추가
crontab -e
# 매일 오전 2시에 백업: 0 2 * * * /home/ubuntu/backup_script.sh
```

---

## 7. 성능 최적화

### 7.1 Docker 리소스 제한
```yaml
# docker-compose.prod.yml에 다음 추가
services:
  nextbill-app:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
```

### 7.2 Nginx 최적화
```bash
# Nginx 최적화 설정
sudo nano /etc/nginx/nginx.conf
```

```nginx
# 워커 프로세스 설정
worker_processes auto;
worker_connections 1024;

# Gzip 압축 설정
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# 캐시 설정
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 8. CI/CD 파이프라인 설정 (GitHub Actions)

### 8.1 GitHub Secrets 설정
GitHub Repository → Settings → Secrets and variables → Actions에서 다음 설정:

```
EC2_HOST: your-instance-public-ip
EC2_USERNAME: ubuntu
EC2_SSH_KEY: your-private-key-content
DOCKER_COMPOSE_FILE: docker-compose.prod.yml
```

### 8.2 GitHub Actions 워크플로우 생성
```bash
# 로컬에서 워크플로우 파일 생성
mkdir -p .github/workflows
nano .github/workflows/deploy.yml
```

**워크플로우 내용은 별도 파일로 생성하겠습니다.**

---

## 9. 문제 해결

### 9.1 일반적인 문제들
```bash
# 1. 애플리케이션이 시작되지 않는 경우
docker-compose -f docker-compose.prod.yml logs nextbill-app

# 2. 데이터베이스 연결 오류
docker-compose -f docker-compose.prod.yml logs mysql

# 3. 포트 충돌
sudo netstat -tlnp | grep :8080
sudo netstat -tlnp | grep :3000

# 4. 메모리 부족
free -m
docker stats

# 5. 디스크 용량 부족
df -h
docker system prune -f
```

### 9.2 롤백 절차
```bash
# 이전 버전으로 롤백
git log --oneline  # 이전 커밋 확인
git checkout previous-commit-hash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 10. 비용 최적화

### 10.1 인스턴스 크기 조정
- **테스트/개발**: t2.micro (1 vCPU, 1GB RAM) - 무료 티어
- **소규모 프로덕션**: t3.small (2 vCPU, 2GB RAM) - 월 $15
- **중간 규모**: t3.medium (2 vCPU, 4GB RAM) - 월 $30
- **대규모**: t3.large (2 vCPU, 8GB RAM) - 월 $60

### 10.2 스토리지 최적화
```bash
# 정기적인 정리
docker system prune -f
sudo apt autoremove -y
sudo apt autoclean

# 로그 로테이션 설정
sudo nano /etc/logrotate.d/nextbill
```

---

## 📞 지원 및 문의

배포 과정에서 문제가 발생하면:

1. **로그 확인**: 위의 로그 명령어 사용
2. **문서 참조**: 이 가이드의 문제 해결 섹션
3. **커뮤니티 지원**: GitHub Issues 또는 이메일 문의

**성공적인 배포를 위해 단계별로 천천히 진행하세요!**
