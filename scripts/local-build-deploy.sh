#!/bin/bash

# NextBill 로컬 빌드 후 서버 배포 스크립트
# 서버에서 빌드가 실패할 경우 로컬에서 빌드 후 배포

set -e

echo "🏗️  NextBill 로컬 빌드 후 서버 배포 시작..."

# 서버 정보 (수정 필요)
SERVER_IP="${1:-YOUR_SERVER_IP}"
SERVER_USER="${2:-ubuntu}"
SERVER_PATH="${3:-/home/ubuntu/NextBill}"

if [ "$SERVER_IP" = "YOUR_SERVER_IP" ]; then
    echo "❌ 서버 IP를 지정해주세요."
    echo "사용법: ./local-build-deploy.sh <서버IP> [사용자명] [배포경로]"
    echo "예시: ./local-build-deploy.sh 13.125.123.45 ubuntu /home/ubuntu/NextBill"
    exit 1
fi

# 1. 로컬에서 프론트엔드 빌드
echo "🔨 로컬에서 프론트엔드 빌드 중..."
cd frontend

# 의존성 설치
if [ ! -d "node_modules" ]; then
    echo "📦 의존성 설치..."
    npm install
fi

# 빌드 실행
echo "🏗️  빌드 실행..."
npm run build

# 빌드 파일 압축
echo "📦 빌드 파일 압축..."
tar -czf ../frontend-dist.tar.gz -C dist .

cd ..

# 2. 빌드 파일을 서버에 업로드
echo "📤 서버에 빌드 파일 업로드..."
scp frontend-dist.tar.gz $SERVER_USER@$SERVER_IP:$SERVER_PATH/

# 3. 서버에서 배포 스크립트 실행
echo "🚀 서버에서 배포 실행..."
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && ./scripts/deploy-prebuilt.sh"

echo "✅ 로컬 빌드 후 서버 배포 완료!"
echo "🌐 서비스 접속: http://$SERVER_IP"

# 임시 파일 정리
rm -f frontend-dist.tar.gz
