#!/bin/bash

# AWS EC2 서버 설정 스크립트
# 이 스크립트는 EC2 인스턴스에서 실행해야 합니다.

set -e

echo "🔧 AWS EC2 서버 환경을 설정합니다..."

# 시스템 업데이트
echo "📦 시스템 패키지를 업데이트합니다..."
sudo apt-get update
sudo apt-get upgrade -y

# Docker 설치
echo "🐳 Docker를 설치합니다..."
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Docker GPG 키 추가
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Docker 저장소 추가
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker 설치
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Docker 서비스 시작 및 자동 시작 설정
sudo systemctl start docker
sudo systemctl enable docker

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# Docker Compose 설치
echo "🔗 Docker Compose를 설치합니다..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git 설치
echo "📂 Git을 설치합니다..."
sudo apt-get install -y git

# 방화벽 설정 (UFW)
echo "🔥 방화벽을 설정합니다..."
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 필요한 유틸리티 설치
echo "🛠 필요한 유틸리티를 설치합니다..."
sudo apt-get install -y curl wget unzip htop

# Nginx 설치 (옵션)
echo "🌐 Nginx를 설치합니다..."
sudo apt-get install -y nginx

# 스왑 파일 생성 (메모리 부족 방지)
echo "💾 스왑 파일을 생성합니다..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# 시스템 리소스 모니터링 설정
echo "📊 시스템 모니터링을 설정합니다..."
cat << 'EOF' | sudo tee /etc/systemd/system/nextbill-monitor.service
[Unit]
Description=NextBill System Monitor
After=network.target

[Service]
Type=oneshot
ExecStart=/bin/bash -c 'echo "$(date): CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk "{print 100 - \$1}"), Memory: $(free | grep Mem | awk "{printf \"%.2f\", \$3/\$2 * 100.0}")%" >> /var/log/nextbill-monitor.log'

[Install]
WantedBy=multi-user.target
EOF

cat << 'EOF' | sudo tee /etc/systemd/system/nextbill-monitor.timer
[Unit]
Description=Run NextBill Monitor every 5 minutes
Requires=nextbill-monitor.service

[Timer]
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo systemctl enable nextbill-monitor.timer
sudo systemctl start nextbill-monitor.timer

echo ""
echo "✅ EC2 서버 설정이 완료되었습니다!"
echo ""
echo "📝 다음 단계:"
echo "1. 터미널을 재시작하거나 다음 명령을 실행하세요: newgrp docker"
echo "2. 프로젝트를 클론하세요: git clone <your-repo-url>"
echo "3. 프로젝트 디렉토리로 이동하세요: cd NextBill"
echo "4. .env 파일을 설정하세요: cp .env.prod .env && nano .env"
echo "5. 배포를 실행하세요: ./deploy.sh"
echo ""
echo "🔍 시스템 정보:"
echo "  - Docker 버전: $(docker --version)"
echo "  - Docker Compose 버전: $(docker-compose --version)"
echo "  - 사용 가능한 메모리: $(free -h | awk '/^Mem:/ {print $7}')"
echo "  - 디스크 공간: $(df -h / | awk 'NR==2 {print $4}')"
