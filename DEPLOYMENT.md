# NextBill AWS EC2 배포 가이드

## 🚀 배포 준비사항

### 1. AWS EC2 인스턴스 설정
- **권장 사양**: t3.medium 이상 (2 vCPU, 4GB RAM)
- **운영체제**: Ubuntu 20.04 LTS 또는 22.04 LTS
- **스토리지**: 20GB 이상
- **보안 그룹**: HTTP(80), HTTPS(443), SSH(22) 포트 개방

### 2. 도메인 설정 (옵션)
- DNS A 레코드를 EC2 퍼블릭 IP로 설정
- SSL 인증서 준비 (Let's Encrypt 권장)

## 📋 배포 단계

### 1단계: EC2 서버 접속
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2단계: 서버 환경 설정
```bash
# 설정 스크립트 다운로드 및 실행
wget https://raw.githubusercontent.com/your-repo/NextBill/main/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh

# 터미널 재시작 또는 Docker 그룹 적용
newgrp docker
```

### 3단계: 프로젝트 클론
```bash
git clone https://github.com/your-username/NextBill.git
cd NextBill
```

### 4단계: 환경변수 설정
```bash
# 환경변수 파일 생성
cp .env.prod .env

# 환경변수 편집
nano .env
```

**필수 설정 항목:**
```bash
# 강력한 패스워드로 변경
MYSQL_ROOT_PASSWORD=your_strong_root_password
MYSQL_PASSWORD=your_strong_db_password

# 긴 보안 키로 변경 (최소 64자)
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here

# Google OAuth2 설정 (Google Cloud Console에서 발급)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_OAUTH2_REDIRECT_URI=http://your-domain.com/login/oauth2/code/google

# Gmail SMTP 설정
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# 도메인 설정
VITE_API_URL=http://your-domain.com/api
```

### 5단계: 배포 실행
```bash
./deploy.sh
```

## 🔧 사후 설정

### SSL 인증서 설정 (HTTPS)
```bash
# Let's Encrypt 설치
sudo apt install certbot python3-certbot-nginx

# 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo crontab -e
# 다음 라인 추가: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 모니터링 설정
```bash
# 컨테이너 상태 확인
docker-compose -f docker-compose-prod.yml ps

# 로그 확인
docker-compose -f docker-compose-prod.yml logs -f backend
docker-compose -f docker-compose-prod.yml logs -f frontend

# 시스템 리소스 모니터링
htop
```

### 백업 설정
```bash
# 데이터베이스 백업 스크립트 생성
cat << 'EOF' > /home/ubuntu/backup-db.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec nextbill-mysql-prod mysqldump -u root -p${MYSQL_ROOT_PASSWORD} nextbill_prod > /home/ubuntu/backups/nextbill_${DATE}.sql
# 7일 이상된 백업 파일 삭제
find /home/ubuntu/backups -name "nextbill_*.sql" -mtime +7 -delete
EOF

chmod +x /home/ubuntu/backup-db.sh

# 백업 디렉토리 생성
mkdir -p /home/ubuntu/backups

# 일일 자동 백업 설정
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup-db.sh") | crontab -
```

## 🚨 트러블슈팅

### 메모리 부족 문제
```bash
# 스왑 사용량 확인
free -h

# 불필요한 컨테이너 정리
docker system prune -a
```

### 포트 충돌 문제
```bash
# 포트 사용 확인
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Nginx 중지 (필요시)
sudo systemctl stop nginx
sudo systemctl disable nginx
```

### 데이터베이스 연결 문제
```bash
# MySQL 컨테이너 로그 확인
docker-compose -f docker-compose-prod.yml logs mysql

# 데이터베이스 직접 접속 테스트
docker exec -it nextbill-mysql-prod mysql -u root -p
```

## 📊 성능 최적화

### 1. JVM 메모리 설정
`docker-compose-prod.yml`의 backend 서비스에 추가:
```yaml
environment:
  JAVA_OPTS: "-Xms512m -Xmx1g"
```

### 2. MySQL 최적화
MySQL 설정 파일을 마운트하여 성능 최적화

### 3. Redis 최적화
Redis 설정을 통한 메모리 관리 최적화

## 🔄 업데이트 방법

```bash
# 최신 코드 가져오기
git pull origin main

# 서비스 재배포
./deploy.sh
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 로그 파일 검토
2. 시스템 리소스 확인
3. 네트워크 연결 상태 확인
4. 환경변수 설정 검토
