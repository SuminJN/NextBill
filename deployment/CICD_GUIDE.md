# 🔧 CI/CD 파이프라인 설정 가이드

## 📋 GitHub Actions를 사용한 자동 배포

NextBill의 CI/CD 파이프라인은 GitHub Actions를 통해 구현되어 있으며, 테스트, 빌드, 배포까지 자동화됩니다.

---

## 1. GitHub Repository 설정

### 1.1 Secrets 설정
GitHub Repository → Settings → Secrets and variables → Actions에서 다음 설정:

#### 공통 Secrets
```
APP_URL: https://your-domain.com (또는 http://your-server-ip)
SLACK_WEBHOOK_URL: your-slack-webhook-url (선택사항)
```

#### AWS EC2 배포용 Secrets
```
EC2_HOST: your-ec2-instance-ip
EC2_USERNAME: ubuntu
EC2_SSH_KEY: |
  -----BEGIN OPENSSH PRIVATE KEY-----
  your-private-key-content-here
  -----END OPENSSH PRIVATE KEY-----
```

#### DigitalOcean 배포용 Secrets
```
DO_HOST: your-droplet-ip
DO_USERNAME: nextbill
DO_SSH_KEY: |
  -----BEGIN OPENSSH PRIVATE KEY-----
  your-private-key-content-here
  -----END OPENSSH PRIVATE KEY-----
```

#### GCP 배포용 Secrets
```
GCP_PROJECT_ID: your-gcp-project-id
GCP_SA_KEY: |
  {
    "type": "service_account",
    "project_id": "your-project-id",
    ...
  }
```

### 1.2 Branch Protection Rules 설정
```
Settings → Branches → Add rule
Branch name pattern: main
- Require a pull request before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Include administrators
```

---

## 2. 워크플로우 구조

### 2.1 파이프라인 단계
```mermaid
graph TD
    A[Code Push] --> B[Checkout Code]
    B --> C[Set up JDK 17]
    C --> D[Cache Gradle]
    D --> E[Run Tests]
    E --> F{Tests Pass?}
    F -->|Yes| G[Build Backend]
    F -->|No| H[Stop Pipeline]
    G --> I[Build Frontend]
    I --> J[Build Docker Images]
    J --> K[Deploy to Server]
    K --> L[Health Check]
    L --> M[Send Notification]
```

### 2.2 트리거 조건
- **자동 배포**: `main` 브랜치에 push 시
- **테스트만**: Pull Request 생성/업데이트 시
- **수동 배포**: 워크플로우 디스패치 이벤트

---

## 3. 로컬 CI/CD 테스트

### 3.1 Act 설치 (GitHub Actions 로컬 실행)
```bash
# macOS
brew install act

# Ubuntu/Debian
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Windows (PowerShell)
choco install act-cli
```

### 3.2 로컬에서 워크플로우 테스트
```bash
# 전체 워크플로우 실행
act

# 특정 잡만 실행
act -j test

# Pull Request 이벤트 시뮬레이션
act pull_request

# 환경 변수 파일 사용
act --env-file .env.act
```

**.env.act 예시:**
```bash
EC2_HOST=test-host
EC2_USERNAME=test-user
APP_URL=http://localhost:8080
```

---

## 4. 서버별 배포 설정

### 4.1 AWS EC2 준비사항
```bash
# EC2 인스턴스에서 실행
# GitHub Actions에서 SSH 접근을 위한 준비

# SSH 키 등록
mkdir -p ~/.ssh
echo "your-public-key" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Docker 명령어 sudo 없이 실행
sudo usermod -aG docker ubuntu

# 프로젝트 디렉토리 준비
cd ~
git clone https://github.com/suminjn/NextBill.git
cd NextBill
chmod +x gradlew

# 환경 변수 설정
cp .env.prod .env
# .env 파일 편집 필요
```

### 4.2 DigitalOcean 준비사항
```bash
# Droplet에서 실행
# 사용자 생성 및 SSH 키 설정이 완료된 상태에서

# Docker 그룹 추가
sudo usermod -aG docker nextbill

# 프로젝트 클론
git clone https://github.com/suminjn/NextBill.git
cd NextBill
chmod +x gradlew

# 환경 변수 설정
cp .env.prod .env
# .env 파일 편집 필요
```

### 4.3 GCP 준비사항
```bash
# Compute Engine 인스턴스에서 실행

# 서비스 계정 키 생성 (로컬에서)
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions Service Account"

gcloud projects add-iam-policy-binding your-project-id \
    --member="serviceAccount:github-actions@your-project-id.iam.gserviceaccount.com" \
    --role="roles/compute.instanceAdmin"

gcloud iam service-accounts keys create key.json \
    --iam-account=github-actions@your-project-id.iam.gserviceaccount.com

# key.json 내용을 GitHub Secrets에 GCP_SA_KEY로 등록
```

---

## 5. 배포 전략

### 5.1 블루-그린 배포 (고급)
```yaml
# .github/workflows/blue-green-deploy.yml
name: Blue-Green Deployment

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to Blue Environment
      run: |
        ssh ${{ secrets.SSH_CONNECTION }} "
          cd NextBill-blue
          git pull origin main
          docker-compose -f docker-compose.blue.yml up -d --build
        "
    
    - name: Health Check Blue Environment
      run: |
        curl -f http://blue.your-domain.com/api/health
    
    - name: Switch Traffic to Blue
      run: |
        ssh ${{ secrets.SSH_CONNECTION }} "
          sudo nginx -s reload  # Load balancer config switch
        "
    
    - name: Stop Green Environment
      run: |
        ssh ${{ secrets.SSH_CONNECTION }} "
          cd NextBill-green
          docker-compose -f docker-compose.green.yml down
        "
```

### 5.2 카나리 배포 (고급)
```yaml
# .github/workflows/canary-deploy.yml
name: Canary Deployment

on:
  push:
    branches: [ main ]

jobs:
  canary-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy Canary (10% traffic)
      run: |
        # Canary 환경에 배포
        # Load balancer에서 10% 트래픽만 canary로 라우팅
    
    - name: Monitor Canary for 10 minutes
      run: |
        # 10분간 모니터링
        # 에러율, 응답시간 체크
    
    - name: Full Deployment or Rollback
      run: |
        # 성공 시 100% 배포, 실패 시 롤백
```

---

## 6. 모니터링 및 알림

### 6.1 Slack 알림 설정
```bash
# Slack Webhook URL 생성
# Slack → Apps → Incoming Webhooks → Add to Slack
# 채널 선택 후 Webhook URL 복사
# GitHub Secrets에 SLACK_WEBHOOK_URL로 등록
```

### 6.2 이메일 알림 설정
```yaml
# 워크플로우에 이메일 알림 추가
- name: Send Email Notification
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 587
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: NextBill Deployment Failed
    to: admin@your-domain.com
    from: noreply@your-domain.com
    body: |
      NextBill deployment failed!
      
      Repository: ${{ github.repository }}
      Branch: ${{ github.ref }}
      Commit: ${{ github.sha }}
      
      Check the logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

### 6.3 Discord 알림 설정
```yaml
- name: Discord Notification
  if: always()
  uses: Ilshidur/action-discord@master
  env:
    DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}
  with:
    args: |
      NextBill deployment ${{ job.status }}!
      Commit: ${{ github.sha }}
      Author: ${{ github.actor }}
```

---

## 7. 보안 설정

### 7.1 환경별 시크릿 관리
```yaml
# 환경별로 다른 시크릿 사용
- name: Set environment variables
  run: |
    if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
      echo "ENVIRONMENT=production" >> $GITHUB_ENV
      echo "SERVER_HOST=${{ secrets.PROD_HOST }}" >> $GITHUB_ENV
    elif [[ "${{ github.ref }}" == "refs/heads/staging" ]]; then
      echo "ENVIRONMENT=staging" >> $GITHUB_ENV
      echo "SERVER_HOST=${{ secrets.STAGING_HOST }}" >> $GITHUB_ENV
    fi
```

### 7.2 코드 보안 검사
```yaml
# 보안 취약점 검사 추가
- name: Run Security Scan
  uses: securecodewarrior/github-action-add-sarif@v1
  with:
    sarif-file: 'security-scan-results.sarif'

- name: Run Dependency Check
  run: ./gradlew dependencyCheckAnalyze

- name: Upload dependency check results
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: build/reports/dependency-check-report.sarif
```

---

## 8. 성능 테스트 자동화

### 8.1 로드 테스트 추가
```yaml
- name: Load Testing
  run: |
    # k6 설치
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
    echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
    sudo apt-get update
    sudo apt-get install k6
    
    # 로드 테스트 실행
    k6 run --vus 10 --duration 30s load-test.js
```

**load-test.js 예시:**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  let response = http.get(`${__ENV.APP_URL}/api/health`);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

### 8.2 성능 임계값 설정
```yaml
- name: Performance Check
  run: |
    # 응답 시간 체크
    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}\n' ${{ secrets.APP_URL }}/api/health)
    
    if (( $(echo "$RESPONSE_TIME > 2.0" | bc -l) )); then
      echo "Response time too slow: ${RESPONSE_TIME}s"
      exit 1
    fi
```

---

## 9. 데이터베이스 마이그레이션

### 9.1 Flyway 마이그레이션
```yaml
- name: Database Migration
  run: |
    ./gradlew flywayMigrate -Pflyway.url=${{ secrets.DB_URL }} \
                           -Pflyway.user=${{ secrets.DB_USER }} \
                           -Pflyway.password=${{ secrets.DB_PASSWORD }}
```

### 9.2 백업 생성
```yaml
- name: Create Database Backup
  run: |
    ssh ${{ secrets.SSH_CONNECTION }} "
      docker exec nextbill-mysql mysqldump -u root -p\$MYSQL_ROOT_PASSWORD nextbill > /tmp/backup_$(date +%Y%m%d_%H%M%S).sql
    "
```

---

## 10. 롤백 전략

### 10.1 자동 롤백
```yaml
- name: Health Check and Rollback
  run: |
    # 헬스 체크
    for i in {1..5}; do
      if curl -f ${{ secrets.APP_URL }}/api/health; then
        echo "Health check passed"
        exit 0
      fi
      echo "Health check failed, attempt $i/5"
      sleep 30
    done
    
    # 롤백 실행
    echo "Health check failed, rolling back..."
    ssh ${{ secrets.SSH_CONNECTION }} "
      cd NextBill
      git checkout HEAD~1
      docker-compose -f docker-compose.prod.yml down
      docker-compose -f docker-compose.prod.yml up -d --build
    "
    exit 1
```

### 10.2 수동 롤백 트리거
```yaml
# .github/workflows/rollback.yml
name: Manual Rollback

on:
  workflow_dispatch:
    inputs:
      commit_sha:
        description: 'Commit SHA to rollback to'
        required: true
        default: 'HEAD~1'

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
    - name: Rollback to specified commit
      run: |
        ssh ${{ secrets.SSH_CONNECTION }} "
          cd NextBill
          git checkout ${{ github.event.inputs.commit_sha }}
          docker-compose -f docker-compose.prod.yml down
          docker-compose -f docker-compose.prod.yml up -d --build
        "
```

---

## 11. 문제 해결

### 11.1 일반적인 CI/CD 문제들

#### SSH 연결 실패
```bash
# SSH 키 권한 확인
chmod 600 ~/.ssh/id_rsa

# SSH 연결 테스트
ssh -v user@server-ip

# Known hosts 문제 해결
ssh-keyscan -H server-ip >> ~/.ssh/known_hosts
```

#### Docker 빌드 실패
```bash
# Docker 캐시 클리어
docker system prune -f

# 메모리 부족 시
docker build --memory=2g .
```

#### 환경 변수 문제
```bash
# 환경 변수 확인
printenv | grep -i nextbill

# Docker Compose 설정 확인
docker-compose config
```

### 11.2 디버깅 도구

#### GitHub Actions 디버깅
```yaml
- name: Debug
  run: |
    echo "GitHub Context:"
    echo "Repository: ${{ github.repository }}"
    echo "Ref: ${{ github.ref }}"
    echo "SHA: ${{ github.sha }}"
    echo "Actor: ${{ github.actor }}"
    
    echo "Environment Variables:"
    env | sort
```

#### SSH 디버깅
```yaml
- name: SSH Debug
  uses: appleboy/ssh-action@v0.1.6
  with:
    host: ${{ secrets.SERVER_HOST }}
    username: ${{ secrets.SERVER_USER }}
    key: ${{ secrets.SSH_KEY }}
    debug: true
    script: |
      whoami
      pwd
      docker --version
      docker-compose --version
```

---

## 12. 최적화 팁

### 12.1 빌드 시간 최적화
```yaml
# Gradle 캐시 최적화
- name: Cache Gradle
  uses: actions/cache@v3
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
      build/
    key: gradle-${{ runner.os }}-${{ hashFiles('**/*.gradle*') }}

# Docker 레이어 캐시
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v2

- name: Build and push
  uses: docker/build-push-action@v4
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### 12.2 병렬 처리
```yaml
strategy:
  matrix:
    environment: [staging, production]
    
steps:
- name: Deploy to ${{ matrix.environment }}
  run: |
    # 환경별 병렬 배포
```

---

## 📊 CI/CD 메트릭 모니터링

### 배포 성공률
- **목표**: 95% 이상
- **측정**: 성공한 배포 / 전체 배포 시도

### 배포 시간
- **목표**: 10분 이내
- **측정**: 빌드 시작부터 배포 완료까지

### 롤백 빈도
- **목표**: 월 1회 이하
- **측정**: 롤백 횟수 / 전체 배포 횟수

---

## 📞 지원 및 문의

CI/CD 관련 문제가 발생하면:

1. **GitHub Actions 로그** 확인
2. **서버 로그** 확인
3. **이 가이드의 문제 해결** 섹션 참조
4. **GitHub Issues** 또는 이메일 문의

**자동화된 CI/CD로 안정적이고 빠른 배포를 경험하세요!**
