#!/bin/bash

# NextBill 프로덕션 배포 스크립트

set -e

echo "🚀 NextBill 프로덕션 배포를 시작합니다..."

# 환경변수 파일 확인
if [ ! -f .env ]; then
    echo "❌ .env 파일이 없습니다. .env.prod를 복사하여 .env 파일을 생성하고 실제 값으로 수정해주세요."
    echo "cp .env.prod .env"
    exit 1
fi

# Docker 및 Docker Compose 설치 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되어 있지 않습니다."
    exit 1
fi

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너를 정리합니다..."
docker-compose -f docker-compose-prod.yml down

# 이미지 빌드
echo "🔨 이미지를 빌드합니다..."
docker-compose -f docker-compose-prod.yml build --no-cache

# 서비스 시작
echo "🚀 서비스를 시작합니다..."
docker-compose -f docker-compose-prod.yml up -d

# 상태 확인
echo "⏳ 서비스 상태를 확인합니다..."
sleep 30

# 헬스체크
echo "🔍 헬스체크를 수행합니다..."
for i in {1..10}; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo "✅ 프론트엔드가 정상적으로 시작되었습니다."
        break
    fi
    echo "⏳ 프론트엔드 시작을 기다리는 중... ($i/10)"
    sleep 10
done

for i in {1..10}; do
    if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo "✅ 백엔드가 정상적으로 시작되었습니다."
        break
    fi
    echo "⏳ 백엔드 시작을 기다리는 중... ($i/10)"
    sleep 10
done

# 최종 상태 출력
echo ""
echo "🎉 배포가 완료되었습니다!"
echo ""
echo "📊 서비스 상태:"
docker-compose -f docker-compose-prod.yml ps
echo ""
echo "🌐 접속 정보:"
echo "  - 프론트엔드: http://localhost"
echo "  - 백엔드 API: http://localhost:8080"
echo "  - 백엔드 헬스체크: http://localhost:8080/actuator/health"
echo ""
echo "📝 로그 확인:"
echo "  - docker-compose -f docker-compose-prod.yml logs -f [서비스명]"
echo ""
echo "🛑 서비스 중지:"
echo "  - docker-compose -f docker-compose-prod.yml down"
