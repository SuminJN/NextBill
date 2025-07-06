# 🚀 Google Cloud Platform (GCP) 배포 가이드

## 📋 GCP Compute Engine을 사용한 NextBill 배포

Google Cloud Platform은 Google OAuth2와의 원활한 통합을 제공하며, NextBill에 최적화된 환경을 제공합니다.

---

## 1. GCP 프로젝트 및 VM 인스턴스 생성

### 1.1 GCP 콘솔 접속 및 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성: "NextBill-Production"
3. 결제 계정 연결 (무료 크레딧 $300 사용 가능)

### 1.2 Compute Engine API 활성화
```bash
# gcloud CLI 설치 후
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
```

### 1.3 VM 인스턴스 생성
```bash
# gcloud 명령어로 인스턴스 생성
gcloud compute instances create nextbill-vm \
    --zone=asia-northeast3-a \
    --machine-type=e2-medium \
    --network-interface=network-tier=PREMIUM,subnet=default \
    --maintenance-policy=MIGRATE \
    --provisioning-model=STANDARD \
    --service-account=your-service-account@nextbill-production.iam.gserviceaccount.com \
    --scopes=https://www.googleapis.com/auth/devstorage.read_only,https://www.googleapis.com/auth/logging.write,https://www.googleapis.com/auth/monitoring.write,https://www.googleapis.com/auth/servicecontrol,https://www.googleapis.com/auth/service.management.readonly,https://www.googleapis.com/auth/trace.append \
    --tags=nextbill-server \
    --create-disk=auto-delete=yes,boot=yes,device-name=nextbill-vm,image=projects/ubuntu-os-cloud/global/images/ubuntu-2204-jammy-v20231030,mode=rw,size=30,type=projects/nextbill-production/zones/asia-northeast3-a/diskTypes/pd-standard \
    --no-shielded-secure-boot \
    --shielded-vtpm \
    --shielded-integrity-monitoring \
    --labels=environment=production,app=nextbill \
    --reservation-affinity=any
```

**또는 웹 콘솔에서:**
```
Name: nextbill-vm
Region: asia-northeast3 (Seoul)
Zone: asia-northeast3-a
Machine Type: e2-medium (2 vCPU, 4GB memory)
Boot Disk: Ubuntu 22.04 LTS, 30GB SSD
Firewall: Allow HTTP and HTTPS traffic
```

### 1.4 방화벽 규칙 생성
```bash
# HTTP 트래픽 허용
gcloud compute firewall-rules create allow-nextbill-http \
    --allow tcp:80 \
    --source-ranges 0.0.0.0/0 \
    --target-tags nextbill-server \
    --description "Allow HTTP traffic for NextBill"

# HTTPS 트래픽 허용
gcloud compute firewall-rules create allow-nextbill-https \
    --allow tcp:443 \
    --source-ranges 0.0.0.0/0 \
    --target-tags nextbill-server \
    --description "Allow HTTPS traffic for NextBill"

# 개발용 포트 (나중에 제거)
gcloud compute firewall-rules create allow-nextbill-dev \
    --allow tcp:8080,tcp:3000 \
    --source-ranges 0.0.0.0/0 \
    --target-tags nextbill-server \
    --description "Allow development ports for NextBill"
```

---

## 2. Google OAuth2 설정

### 2.1 OAuth2 클라이언트 생성
1. GCP 콘솔 → APIs & Services → Credentials
2. "+ CREATE CREDENTIALS" → OAuth client ID
3. Application type: Web application
4. Name: NextBill Production

### 2.2 승인된 리디렉션 URI 설정
```
승인된 JavaScript 오리진:
- https://your-domain.com
- https://your-vm-external-ip (임시, 테스트용)

승인된 리디렉션 URI:
- https://your-domain.com/oauth2/callback/google
- https://your-domain.com/api/auth/oauth2/callback/google
- https://your-vm-external-ip/oauth2/callback/google (임시)
```

### 2.3 OAuth2 동의 화면 설정
```
Application name: NextBill
User support email: your-email@gmail.com
Application logo: (선택사항)
Application home page: https://your-domain.com
Application privacy policy: https://your-domain.com/privacy
Application terms of service: https://your-domain.com/terms

Scopes:
- email
- profile
- openid
```

---

## 3. VM 인스턴스 설정

### 3.1 SSH 접속
```bash
# gcloud CLI로 접속
gcloud compute ssh nextbill-vm --zone=asia-northeast3-a

# 또는 웹 콘솔에서 SSH 버튼 클릭
```

### 3.2 시스템 초기 설정
```bash
#!/bin/bash

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y curl wget git unzip htop

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# gcloud CLI 업데이트 (이미 설치되어 있음)
sudo apt-get update && sudo apt-get install google-cloud-cli

# 재로그인
exit
```

### 3.3 다시 접속하여 설정 확인
```bash
gcloud compute ssh nextbill-vm --zone=asia-northeast3-a

# Docker 확인
docker --version
docker-compose --version

# VM 정보 확인
curl -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/external-ip
```

---

## 4. 애플리케이션 배포

### 4.1 프로젝트 클론
```bash
# 프로젝트 클론
git clone https://github.com/suminjn/NextBill.git
cd NextBill

# 실행 권한 부여
chmod +x gradlew
```

### 4.2 환경 변수 설정
```bash
# 환경 변수 파일 생성
cp .env.prod .env
nano .env
```

**GCP 최적화 환경 변수:**
```bash
# 데이터베이스 설정
MYSQL_ROOT_PASSWORD=gcp-nextbill-root-2024!
MYSQL_PASSWORD=gcp-nextbill-db-2024!
REDIS_PASSWORD=gcp-nextbill-redis-2024!

# JWT 시크릿
JWT_SECRET=gcp-super-secret-jwt-key-for-nextbill-production-256-bits-minimum

# Google OAuth2 (GCP에서 생성한 것)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Gmail 설정
NEXTBILL_EMAIL_USERNAME=your-gmail@gmail.com
NEXTBILL_EMAIL_PASSWORD=your-gmail-app-password

# 도메인 설정
DOMAIN=your-domain.com
```

### 4.3 배포 실행
```bash
# 프로덕션 빌드 및 실행
docker-compose -f docker-compose.prod.yml up -d

# 빌드 진행상황 확인
docker-compose -f docker-compose.prod.yml logs -f

# 서비스 상태 확인
docker-compose -f docker-compose.prod.yml ps
```

### 4.4 초기 접속 테스트
```bash
# VM 외부 IP 확인
EXTERNAL_IP=$(curl -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/external-ip)
echo "External IP: $EXTERNAL_IP"

# 애플리케이션 테스트
curl http://localhost:8080/api/health
curl http://$EXTERNAL_IP:8080/api/health
```

---

## 5. Cloud Load Balancer 및 SSL 설정

### 5.1 고정 IP 주소 생성
```bash
# 외부 고정 IP 생성
gcloud compute addresses create nextbill-static-ip \
    --region=asia-northeast3 \
    --description="Static IP for NextBill production"

# 고정 IP 확인
gcloud compute addresses list
```

### 5.2 도메인 DNS 설정
```bash
# 고정 IP 주소 확인
STATIC_IP=$(gcloud compute addresses describe nextbill-static-ip --region=asia-northeast3 --format="value(address)")
echo "Static IP: $STATIC_IP"

# DNS A 레코드 설정
# your-domain.com → $STATIC_IP
# www.your-domain.com → $STATIC_IP
```

### 5.3 SSL 인증서 생성 (Google 관리형)
```bash
# Google 관리형 SSL 인증서 생성
gcloud compute ssl-certificates create nextbill-ssl-cert \
    --domains=your-domain.com,www.your-domain.com \
    --description="SSL certificate for NextBill production"

# 인증서 상태 확인
gcloud compute ssl-certificates list
```

### 5.4 Load Balancer 설정
```bash
# 인스턴스 그룹 생성
gcloud compute instance-groups unmanaged create nextbill-ig \
    --zone=asia-northeast3-a \
    --description="Instance group for NextBill"

# 인스턴스를 그룹에 추가
gcloud compute instance-groups unmanaged add-instances nextbill-ig \
    --instances=nextbill-vm \
    --zone=asia-northeast3-a

# 헬스 체크 생성
gcloud compute health-checks create http nextbill-health-check \
    --port=80 \
    --request-path=/api/health \
    --check-interval=30s \
    --timeout=10s \
    --healthy-threshold=2 \
    --unhealthy-threshold=3

# 백엔드 서비스 생성
gcloud compute backend-services create nextbill-backend-service \
    --protocol=HTTP \
    --health-checks=nextbill-health-check \
    --global

# 백엔드에 인스턴스 그룹 추가
gcloud compute backend-services add-backend nextbill-backend-service \
    --instance-group=nextbill-ig \
    --instance-group-zone=asia-northeast3-a \
    --global

# URL 맵 생성
gcloud compute url-maps create nextbill-url-map \
    --default-service=nextbill-backend-service

# HTTPS 프록시 생성
gcloud compute target-https-proxies create nextbill-https-proxy \
    --url-map=nextbill-url-map \
    --ssl-certificates=nextbill-ssl-cert

# 글로벌 포워딩 규칙 생성
gcloud compute forwarding-rules create nextbill-https-forwarding-rule \
    --address=nextbill-static-ip \
    --global \
    --target-https-proxy=nextbill-https-proxy \
    --ports=443

# HTTP to HTTPS 리디렉션
gcloud compute url-maps create nextbill-http-redirect \
    --default-url-redirect-response-code=301 \
    --default-url-redirect-https-redirect

gcloud compute target-http-proxies create nextbill-http-proxy \
    --url-map=nextbill-http-redirect

gcloud compute forwarding-rules create nextbill-http-forwarding-rule \
    --address=nextbill-static-ip \
    --global \
    --target-http-proxy=nextbill-http-proxy \
    --ports=80
```

---

## 6. Cloud SQL 및 Memorystore (선택사항)

### 6.1 Cloud SQL (MySQL) 설정
```bash
# Cloud SQL 인스턴스 생성
gcloud sql instances create nextbill-mysql \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=asia-northeast3 \
    --storage-size=20GB \
    --storage-type=SSD \
    --backup-start-time=02:00 \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=03

# 데이터베이스 생성
gcloud sql databases create nextbill \
    --instance=nextbill-mysql

# 사용자 생성
gcloud sql users create nextbill \
    --instance=nextbill-mysql \
    --password=your-cloud-sql-password

# VM에서 Cloud SQL 접근 허용
gcloud sql instances patch nextbill-mysql \
    --authorized-networks=0.0.0.0/0
```

### 6.2 Memorystore (Redis) 설정
```bash
# Redis 인스턴스 생성
gcloud redis instances create nextbill-redis \
    --size=1 \
    --region=asia-northeast3 \
    --redis-version=redis_7_0 \
    --auth-enabled
```

---

## 7. 모니터링 및 로깅

### 7.1 Cloud Monitoring 설정
```bash
# Monitoring 에이전트 설치
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install

# 에이전트 상태 확인
sudo systemctl status google-cloud-ops-agent
```

### 7.2 Alert Policy 생성
```bash
# CPU 사용률 알림 정책 생성 (gcloud CLI 또는 웹 콘솔)
gcloud alpha monitoring policies create --policy-from-file=cpu-alert-policy.yaml
```

**cpu-alert-policy.yaml 예시:**
```yaml
displayName: "NextBill High CPU Usage"
conditions:
  - displayName: "CPU usage is above 80%"
    conditionThreshold:
      filter: 'resource.type="gce_instance" AND resource.label.instance_id="nextbill-vm"'
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 0.8
      duration: 300s
notificationChannels:
  - "projects/nextbill-production/notificationChannels/your-notification-channel-id"
```

### 7.3 로그 확인
```bash
# Cloud Logging에서 로그 확인
gcloud logging read "resource.type=gce_instance AND resource.labels.instance_id=nextbill-vm" \
    --limit=50 \
    --format="table(timestamp,severity,textPayload)"

# 애플리케이션 로그
docker-compose -f docker-compose.prod.yml logs -f nextbill-app
```

---

## 8. 자동 백업 및 스냅샷

### 8.1 디스크 스냅샷 자동화
```bash
# 스냅샷 스케줄 생성
gcloud compute resource-policies create snapshot-schedule nextbill-daily-backup \
    --region=asia-northeast3 \
    --max-retention-days=7 \
    --on-source-disk-delete=keep-auto-snapshots \
    --daily-schedule \
    --start-time=02:00 \
    --storage-location=asia

# VM 디스크에 스냅샷 정책 적용
gcloud compute disks add-resource-policies nextbill-vm \
    --resource-policies=nextbill-daily-backup \
    --zone=asia-northeast3-a
```

### 8.2 Cloud Storage 백업
```bash
# Cloud Storage 버킷 생성
gsutil mb -c STANDARD -l asia-northeast3 gs://nextbill-backups

# 데이터베이스 백업 스크립트
cat > ~/backup_to_gcs.sh << 'EOF'
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="nextbill_backup_$DATE.sql"

# 데이터베이스 백업
docker exec nextbill-mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD nextbill > /tmp/$BACKUP_FILE

# Cloud Storage에 업로드
gsutil cp /tmp/$BACKUP_FILE gs://nextbill-backups/database/

# 로컬 파일 삭제
rm /tmp/$BACKUP_FILE

# 30일 이상 된 백업 삭제
gsutil ls gs://nextbill-backups/database/ | grep -E "nextbill_backup_[0-9]{8}_[0-9]{6}\.sql" | head -n -30 | xargs -r gsutil rm

echo "Backup completed: $BACKUP_FILE"
EOF

chmod +x ~/backup_to_gcs.sh

# 크론탭에 추가
crontab -e
# 매일 오전 3시: 0 3 * * * /home/your-username/backup_to_gcs.sh
```

---

## 9. 비용 최적화

### 9.1 인스턴스 크기 조정
```bash
# 현재 사용률 확인
gcloud compute instances describe nextbill-vm \
    --zone=asia-northeast3-a \
    --format="get(machineType)"

# 인스턴스 크기 변경 (필요시)
gcloud compute instances stop nextbill-vm --zone=asia-northeast3-a
gcloud compute instances set-machine-type nextbill-vm \
    --machine-type=e2-small \
    --zone=asia-northeast3-a
gcloud compute instances start nextbill-vm --zone=asia-northeast3-a
```

### 9.2 비용 모니터링
```bash
# 현재 월 비용 확인
gcloud billing accounts list
gcloud billing budgets list --billing-account=your-billing-account-id

# 예산 알림 설정
gcloud billing budgets create \
    --billing-account=your-billing-account-id \
    --display-name="NextBill Monthly Budget" \
    --budget-amount=50USD \
    --threshold-rule=threshold-percent=0.5,spend-basis=current-spend \
    --threshold-rule=threshold-percent=0.8,spend-basis=current-spend \
    --threshold-rule=threshold-percent=1.0,spend-basis=current-spend
```

---

## 10. CI/CD 파이프라인 (Cloud Build)

### 10.1 Cloud Build 설정
```bash
# Cloud Build API 활성화
gcloud services enable cloudbuild.googleapis.com

# GitHub 연동 설정 (웹 콘솔에서)
# https://console.cloud.google.com/cloud-build/triggers
```

### 10.2 cloudbuild.yaml 생성
```yaml
steps:
# 빌드 단계
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', 'gcr.io/$PROJECT_ID/nextbill-app', '.']

# 이미지 푸시
- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'gcr.io/$PROJECT_ID/nextbill-app']

# VM에 배포
- name: 'gcr.io/cloud-builders/gcloud'
  args:
  - 'compute'
  - 'ssh'
  - 'nextbill-vm'
  - '--zone=asia-northeast3-a'
  - '--command=cd NextBill && git pull && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d --build'

images:
- 'gcr.io/$PROJECT_ID/nextbill-app'
```

---

## 11. 보안 설정

### 11.1 IAM 역할 설정
```bash
# 서비스 계정 생성
gcloud iam service-accounts create nextbill-vm-sa \
    --display-name="NextBill VM Service Account"

# 최소 권한 부여
gcloud projects add-iam-policy-binding nextbill-production \
    --member="serviceAccount:nextbill-vm-sa@nextbill-production.iam.gserviceaccount.com" \
    --role="roles/logging.logWriter"

gcloud projects add-iam-policy-binding nextbill-production \
    --member="serviceAccount:nextbill-vm-sa@nextbill-production.iam.gserviceaccount.com" \
    --role="roles/monitoring.metricWriter"
```

### 11.2 방화벽 규칙 최적화
```bash
# 개발용 포트 제거 (프로덕션에서)
gcloud compute firewall-rules delete allow-nextbill-dev

# SSH 접근 제한
gcloud compute firewall-rules create allow-ssh-from-office \
    --allow tcp:22 \
    --source-ranges your-office-ip/32 \
    --target-tags nextbill-server \
    --description "Allow SSH from office only"
```

---

## 12. 문제 해결

### 12.1 일반적인 문제들
```bash
# 1. OAuth2 콜백 오류
# Google Cloud Console에서 리디렉션 URI 확인

# 2. 로드 밸런서 헬스 체크 실패
gcloud compute backend-services get-health nextbill-backend-service --global

# 3. SSL 인증서 상태 확인
gcloud compute ssl-certificates describe nextbill-ssl-cert

# 4. VM 성능 모니터링
gcloud compute instances describe nextbill-vm \
    --zone=asia-northeast3-a \
    --format="get(status,cpuPlatform)"
```

### 12.2 로그 분석
```bash
# Cloud Logging에서 오류 로그 검색
gcloud logging read "severity>=ERROR" --limit=100

# 애플리케이션 특정 로그
docker-compose -f docker-compose.prod.yml logs --tail=100 nextbill-app
```

---

## 📊 예상 비용 (월간)

### 기본 구성
- **Compute Engine (e2-medium)**: ~$25
- **Static IP**: $1.46
- **Cloud Storage (백업)**: ~$1
- **Network Egress**: ~$5
- **총합**: ~$32/월

### 확장 구성 (Cloud SQL, Load Balancer 포함)
- **Compute Engine (e2-standard-2)**: ~$50
- **Cloud SQL (db-f1-micro)**: ~$7
- **Load Balancer**: ~$20
- **기타**: ~$10
- **총합**: ~$87/월

---

## 📞 지원 및 문의

GCP 배포 관련 문의:
- **Google Cloud 지원**: [Cloud Console 지원](https://cloud.google.com/support)
- **NextBill 프로젝트**: GitHub Issues 또는 이메일

**GCP의 강력한 인프라를 활용하여 안정적인 NextBill 서비스를 제공하세요!**
