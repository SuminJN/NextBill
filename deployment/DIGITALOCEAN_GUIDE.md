# 🚀 DigitalOcean 배포 가이드

## 📋 DigitalOcean Droplet을 사용한 NextBill 배포

DigitalOcean은 간단하고 직관적인 인터페이스를 제공하며, 고정 가격으로 예측 가능한 비용을 제공합니다.

---

## 1. DigitalOcean 계정 및 Droplet 생성

### 1.1 DigitalOcean 계정 생성
1. [DigitalOcean](https://www.digitalocean.com/) 가입
2. 결제 방법 등록 (신용카드 또는 PayPal)
3. 첫 가입 시 $200 크레딧 제공 (2개월)

### 1.2 Droplet 생성
```
1. Create → Droplets 클릭
2. 설정 선택:
   - Image: Ubuntu 22.04 LTS
   - Plan: Basic
   - CPU Options: Regular Intel ($20/month, 4GB RAM, 2 vCPUs, 80GB SSD)
   - Region: Singapore (아시아 최적화)
   - Authentication: SSH Key (권장) 또는 Password
   - Hostname: nextbill-production
   - Tags: nextbill, production
```

### 1.3 SSH 키 설정 (권장)
```bash
# 로컬에서 SSH 키 생성
ssh-keygen -t ed25519 -C "your-email@example.com"

# 공개 키 내용 복사
cat ~/.ssh/id_ed25519.pub

# DigitalOcean 콘솔에서 SSH 키 추가
# Account → Security → SSH Keys → Add SSH Key
```

---

## 2. 도메인 및 DNS 설정

### 2.1 도메인 연결 (선택사항)
```
DigitalOcean Networking → Domains → Add Domain
- Domain: your-domain.com
- Droplet: nextbill-production

DNS 레코드 설정:
- A Record: @ → your-droplet-ip
- CNAME Record: www → your-domain.com
```

### 2.2 Floating IP 생성 (권장)
```bash
# 웹 콘솔에서 Floating IP 생성
# Networking → Floating IPs → Create Floating IP
# Droplet: nextbill-production
```

---

## 3. 서버 초기 설정

### 3.1 Droplet 접속
```bash
# SSH로 접속
ssh root@your-droplet-ip

# 또는 SSH 키 사용
ssh -i ~/.ssh/id_ed25519 root@your-droplet-ip
```

### 3.2 시스템 업데이트 및 보안 설정
```bash
#!/bin/bash

# 시스템 업데이트
apt update && apt upgrade -y

# 새 사용자 생성 (보안을 위해)
adduser nextbill
usermod -aG sudo nextbill

# SSH 키 복사 (새 사용자에게)
mkdir -p /home/nextbill/.ssh
cp /root/.ssh/authorized_keys /home/nextbill/.ssh/
chown -R nextbill:nextbill /home/nextbill/.ssh
chmod 700 /home/nextbill/.ssh
chmod 600 /home/nextbill/.ssh/authorized_keys

# 방화벽 설정
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# SSH 보안 강화
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

echo "Basic security setup completed. Please reconnect as nextbill user."
```

### 3.3 새 사용자로 재접속
```bash
# 새 사용자로 접속
ssh nextbill@your-droplet-ip
```

---

## 4. Docker 및 애플리케이션 설정

### 4.1 Docker 설치
```bash
# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 사용자를 docker 그룹에 추가
sudo usermod -aG docker nextbill

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 로그아웃 후 다시 로그인
exit
ssh nextbill@your-droplet-ip

# Docker 설치 확인
docker --version
docker-compose --version
```

### 4.2 필수 패키지 설치
```bash
# 필수 도구 설치
sudo apt install -y curl wget git unzip htop tree nginx certbot python3-certbot-nginx

# Git 설정
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

---

## 5. NextBill 애플리케이션 배포

### 5.1 프로젝트 클론
```bash
# 프로젝트 클론
git clone https://github.com/suminjn/NextBill.git
cd NextBill

# 실행 권한 부여
chmod +x gradlew
```

### 5.2 환경 변수 설정
```bash
# 환경 변수 파일 생성
cp .env.prod .env
nano .env
```

**DigitalOcean 최적화 환경 변수:**
```bash
# 데이터베이스 설정
MYSQL_ROOT_PASSWORD=do-nextbill-root-secure-2024!
MYSQL_PASSWORD=do-nextbill-mysql-secure-2024!
REDIS_PASSWORD=do-nextbill-redis-secure-2024!

# JWT 시크릿 (256비트 이상)
JWT_SECRET=digitalocean-nextbill-jwt-secret-key-must-be-256-bits-minimum-for-production

# Google OAuth2 설정
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 이메일 설정
NEXTBILL_EMAIL_USERNAME=your-email@gmail.com
NEXTBILL_EMAIL_PASSWORD=your-gmail-app-password

# 도메인 설정
DOMAIN=your-domain.com
```

### 5.3 Docker 컨테이너 실행
```bash
# 프로덕션 환경 빌드 및 실행
docker-compose -f docker-compose.prod.yml up -d

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f

# 서비스 상태 확인
docker-compose -f docker-compose.prod.yml ps
```

### 5.4 초기 접속 테스트
```bash
# 애플리케이션 테스트
curl http://localhost:8080/api/health

# 외부 접속 테스트
curl http://your-droplet-ip:8080/api/health
```

---

## 6. Nginx 리버스 프록시 및 SSL 설정

### 6.1 Nginx 설정
```bash
# 기본 설정 제거
sudo rm /etc/nginx/sites-enabled/default

# NextBill 설정 파일 생성
sudo nano /etc/nginx/sites-available/nextbill
```

**Nginx 설정 내용:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com your-droplet-ip;

    # 프론트엔드 (React)
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
        
        # React Router 지원
        try_files $uri $uri/ @fallback;
    }

    location @fallback {
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

    # 백엔드 API
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

    # 정적 파일 캐싱
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }

    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 로그 설정
    access_log /var/log/nginx/nextbill.access.log;
    error_log /var/log/nginx/nextbill.error.log;
}
```

```bash
# 설정 활성화
sudo ln -s /etc/nginx/sites-available/nextbill /etc/nginx/sites-enabled/

# 설정 테스트
sudo nginx -t

# Nginx 시작 및 자동 시작 설정
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6.2 SSL 인증서 설정 (Let's Encrypt)
```bash
# 도메인이 있는 경우
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 인증서 자동 갱신 테스트
sudo certbot renew --dry-run

# 자동 갱신 크론잡 설정
sudo crontab -e
# 다음 줄 추가: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 7. DigitalOcean 추가 서비스 활용

### 7.1 Managed Database (선택사항)
```bash
# DigitalOcean 콘솔에서 Managed Database 생성
# Database: MySQL 8.0
# Plan: Basic ($15/month)
# Region: Singapore
# Database Name: nextbill
# User: nextbill
```

**Managed Database 사용 시 docker-compose.prod.yml 수정:**
```yaml
# MySQL 서비스 제거하고 환경 변수 수정
services:
  nextbill-app:
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://your-managed-db-host:25060/nextbill?useSSL=true&requireSSL=true&serverTimezone=UTC
      - SPRING_DATASOURCE_USERNAME=nextbill
      - SPRING_DATASOURCE_PASSWORD=your-managed-db-password
```

### 7.2 Spaces (Object Storage) 백업
```bash
# s3cmd 설치 (Spaces는 S3 호환)
sudo apt install s3cmd -y

# Spaces 설정
s3cmd --configure
# Access Key: your-spaces-access-key
# Secret Key: your-spaces-secret-key
# Default Region: sgp1
# S3 Endpoint: sgp1.digitaloceanspaces.com

# 백업 스크립트 생성
cat > ~/backup_to_spaces.sh << 'EOF'
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/nextbill-backup"
SPACES_BUCKET="s3://nextbill-backups"

mkdir -p $BACKUP_DIR

# 데이터베이스 백업
docker exec nextbill-mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD nextbill > $BACKUP_DIR/nextbill_db_$DATE.sql

# 애플리케이션 설정 백업
cp ~/NextBill/.env $BACKUP_DIR/env_$DATE.backup

# Spaces에 업로드
s3cmd put $BACKUP_DIR/* $SPACES_BUCKET/

# 로컬 백업 파일 삭제
rm -rf $BACKUP_DIR

# 30일 이상 된 백업 삭제
s3cmd ls $SPACES_BUCKET/ | grep -E "nextbill_db_[0-9]{8}_[0-9]{6}\.sql" | head -n -30 | awk '{print $4}' | xargs -r s3cmd del

echo "Backup completed to DigitalOcean Spaces: $DATE"
EOF

chmod +x ~/backup_to_spaces.sh

# 크론탭에 추가
crontab -e
# 매일 오전 3시: 0 3 * * * /home/nextbill/backup_to_spaces.sh
```

### 7.3 Load Balancer 설정 (확장 시)
```bash
# 여러 Droplet으로 확장 시 Load Balancer 사용
# DigitalOcean 콘솔에서 Load Balancer 생성
# Algorithm: Round Robin
# Health Check: HTTP GET /api/health
# Sticky Sessions: Enabled
# SSL Passthrough: Disabled (SSL Termination)
```

---

## 8. 모니터링 및 알림

### 8.1 DigitalOcean 모니터링
```bash
# Droplet 모니터링 에이전트 설치
curl -sSL https://repos.insights.digitalocean.com/install.sh | sudo bash

# 모니터링 설정 확인
sudo systemctl status do-agent
```

### 8.2 업타임 모니터링
```bash
# 외부 모니터링 도구 설정 (Uptime Robot 등)
# URL: https://your-domain.com/api/health
# Check Interval: 5 minutes
# Alert Contacts: your-email@example.com
```

### 8.3 로그 관리
```bash
# 로그 로테이션 설정
sudo nano /etc/logrotate.d/nextbill

# 내용:
/var/log/nginx/nextbill.*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}

# Docker 로그 제한
sudo nano /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

sudo systemctl restart docker
```

---

## 9. 성능 최적화

### 9.1 시스템 최적화
```bash
# 스왑 파일 생성 (메모리 부족 시)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 영구 스왑 설정
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 스왑 사용률 조정
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

### 9.2 Nginx 성능 최적화
```bash
# Nginx 설정 최적화
sudo nano /etc/nginx/nginx.conf

# 다음 설정 추가/수정:
worker_processes auto;
worker_connections 1024;

# Gzip 압축
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied expired no-cache no-store private auth;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json image/svg+xml;

# 버퍼 크기 최적화
client_body_buffer_size 10K;
client_header_buffer_size 1k;
client_max_body_size 8m;
large_client_header_buffers 4 4k;

# 타임아웃 설정
client_body_timeout 12;
client_header_timeout 12;
keepalive_timeout 15;
send_timeout 10;

# 캐시 설정
open_file_cache max=1000 inactive=20s;
open_file_cache_valid 30s;
open_file_cache_min_uses 2;
open_file_cache_errors on;
```

### 9.3 데이터베이스 최적화
```bash
# MySQL 설정 최적화
sudo nano /etc/mysql/mysql.conf.d/nextbill.cnf

# 내용:
[mysqld]
# 기본 설정
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# 연결 설정
max_connections = 100
thread_cache_size = 8
table_open_cache = 2000

# 쿼리 캐시
query_cache_type = 1
query_cache_size = 64M
query_cache_limit = 2M

# 슬로우 쿼리 로그
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
```

---

## 10. 보안 강화

### 10.1 fail2ban 설정
```bash
# fail2ban 설치
sudo apt install fail2ban -y

# 설정 파일 생성
sudo nano /etc/fail2ban/jail.local

# 내용:
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-req-limit]
enabled = true
filter = nginx-req-limit
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10

# fail2ban 시작
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 10.2 자동 보안 업데이트
```bash
# unattended-upgrades 설치
sudo apt install unattended-upgrades -y

# 자동 업데이트 설정
sudo dpkg-reconfigure -plow unattended-upgrades

# 설정 확인
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

### 10.3 침입 탐지 시스템
```bash
# rkhunter 설치 (루트킷 탐지)
sudo apt install rkhunter -y

# 초기 데이터베이스 생성
sudo rkhunter --update
sudo rkhunter --propupd

# 주기적 검사 설정
sudo crontab -e
# 매주 일요일 오전 3시: 0 3 * * 0 /usr/bin/rkhunter --check --skip-keypress --report-warnings-only
```

---

## 11. 재해 복구 계획

### 11.1 Droplet 스냅샷 자동화
```bash
# 스냅샷 생성 스크립트
cat > ~/create_snapshot.sh << 'EOF'
#!/bin/bash

# DigitalOcean API 토큰 설정
DO_TOKEN="your-digitalocean-api-token"
DROPLET_ID="your-droplet-id"
SNAPSHOT_NAME="nextbill-auto-snapshot-$(date +%Y%m%d-%H%M%S)"

# 스냅샷 생성
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DO_TOKEN" \
  -d '{"type":"snapshot","name":"'$SNAPSHOT_NAME'"}' \
  "https://api.digitalocean.com/v2/droplets/$DROPLET_ID/actions"

echo "Snapshot created: $SNAPSHOT_NAME"
EOF

chmod +x ~/create_snapshot.sh

# 주간 스냅샷 생성
crontab -e
# 매주 일요일 오전 2시: 0 2 * * 0 /home/nextbill/create_snapshot.sh
```

### 11.2 복구 절차 문서화
```bash
# 복구 매뉴얼 생성
cat > ~/DISASTER_RECOVERY.md << 'EOF'
# NextBill 재해 복구 매뉴얼

## 1. 새 Droplet 생성
- 최신 스냅샷에서 Droplet 생성
- 동일한 크기 및 리전 선택
- SSH 키 설정

## 2. DNS 업데이트
- 도메인 A 레코드를 새 IP로 변경
- TTL 최소화 (300초)

## 3. SSL 인증서 재발급
```bash
sudo certbot --nginx -d your-domain.com
```

## 4. 백업 복원
```bash
# 최신 백업 다운로드
s3cmd get s3://nextbill-backups/nextbill_db_latest.sql

# 데이터베이스 복원
docker exec -i nextbill-mysql mysql -u root -p$MYSQL_ROOT_PASSWORD nextbill < nextbill_db_latest.sql
```

## 5. 서비스 확인
- 애플리케이션 로그 확인
- 데이터베이스 연결 테스트
- 프론트엔드 접속 확인
- OAuth2 콜백 테스트
EOF
```

---

## 12. 성능 모니터링

### 12.1 시스템 리소스 모니터링
```bash
# 모니터링 스크립트 생성
cat > ~/monitor.sh << 'EOF'
#!/bin/bash

# 시스템 정보 수집
echo "=== System Status Report $(date) ==="
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1

echo "Memory Usage:"
free -m | awk 'NR==2{printf "%.2f%%\n", $3*100/$2}'

echo "Disk Usage:"
df -h | grep -E "/$|/home" | awk '{print $5}' | head -1

echo "Load Average:"
uptime | awk -F'load average:' '{print $2}'

echo "Docker Container Status:"
docker-compose -f ~/NextBill/docker-compose.prod.yml ps

echo "Application Health:"
curl -s http://localhost:8080/api/health || echo "API Health Check Failed"

echo "=== End Report ==="
EOF

chmod +x ~/monitor.sh

# 매시간 모니터링
crontab -e
# 매시간: 0 * * * * /home/nextbill/monitor.sh >> /var/log/nextbill-monitor.log 2>&1
```

### 12.2 알림 설정
```bash
# 이메일 알림 설정
sudo apt install mailutils -y

# 알림 스크립트
cat > ~/alert.sh << 'EOF'
#!/bin/bash

# CPU 사용률 체크
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d'.' -f1)

if [ $CPU_USAGE -gt 80 ]; then
    echo "High CPU Usage Alert: $CPU_USAGE%" | mail -s "NextBill Server Alert" your-email@example.com
fi

# 메모리 사용률 체크
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')

if [ $MEM_USAGE -gt 85 ]; then
    echo "High Memory Usage Alert: $MEM_USAGE%" | mail -s "NextBill Server Alert" your-email@example.com
fi

# 디스크 사용률 체크
DISK_USAGE=$(df -h | grep -E "/$" | awk '{print $5}' | cut -d'%' -f1)

if [ $DISK_USAGE -gt 85 ]; then
    echo "High Disk Usage Alert: $DISK_USAGE%" | mail -s "NextBill Server Alert" your-email@example.com
fi
EOF

chmod +x ~/alert.sh

# 5분마다 체크
crontab -e
# */5 * * * * /home/nextbill/alert.sh
```

---

## 📊 DigitalOcean 예상 비용

### 기본 구성 ($20/월)
- **Basic Droplet**: 4GB RAM, 2 vCPUs, 80GB SSD
- **Backup**: +20% ($4/월)
- **Monitoring**: 무료
- **총합**: ~$24/월

### 확장 구성 ($60/월)
- **Droplet**: 8GB RAM, 4 vCPUs, 160GB SSD ($40/월)
- **Managed Database**: MySQL Basic ($15/월)
- **Spaces**: 250GB ($5/월)
- **Load Balancer**: $12/월
- **총합**: ~$72/월

### 추가 비용
- **도메인**: $10-15/년
- **추가 스토리지**: $10/100GB/월
- **대역폭**: 1TB 포함, 초과 시 $0.01/GB

---

## 🚀 배포 후 체크리스트

### 즉시 확인 사항
- [ ] 웹사이트 접속 확인
- [ ] API 엔드포인트 테스트
- [ ] Google OAuth2 로그인 테스트
- [ ] 데이터베이스 연결 확인
- [ ] 이메일 알림 테스트

### 24시간 내 확인 사항
- [ ] 모니터링 알림 테스트
- [ ] 백업 스크립트 실행 확인
- [ ] 로그 파일 확인
- [ ] 성능 지표 모니터링
- [ ] SSL 인증서 상태 확인

### 주간 확인 사항
- [ ] 시스템 업데이트 적용
- [ ] 백업 파일 확인
- [ ] 보안 로그 검토
- [ ] 성능 최적화 검토
- [ ] 비용 모니터링

---

## 📞 지원 및 문의

DigitalOcean 배포 관련 문의:
- **DigitalOcean 지원**: [Support Center](https://www.digitalocean.com/support)
- **NextBill 프로젝트**: GitHub Issues
- **커뮤니티**: [DigitalOcean Community](https://www.digitalocean.com/community)

**간단하고 안정적인 DigitalOcean에서 NextBill을 성공적으로 배포하세요!**
