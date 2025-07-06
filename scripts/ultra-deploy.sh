#!/bin/bash

# NextBill Ultra 최적화 배포 스크립트
# 메모리가 매우 제한적인 환경용 (1GB 이하)

set -e

echo "🚀 NextBill Ultra 최적화 배포 시작..."

# 환경 변수 확인
if [ ! -f ".env.prod" ]; then
    echo "❌ .env.prod 파일이 없습니다. 먼저 환경 변수를 설정해주세요."
    exit 1
fi

# 메모리 확인
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
echo "📊 시스템 메모리: ${TOTAL_MEM}MB"

if [ "$TOTAL_MEM" -lt 1024 ]; then
    echo "⚠️  메모리가 1GB 미만입니다. 극한 최적화 모드로 진행합니다."
    COMPOSE_FILE="docker-compose.ultra.yml"
    MEMORY_MODE="ultra"
else
    echo "✅ 메모리가 충분합니다. 일반 최적화 모드로 진행합니다."
    COMPOSE_FILE="docker-compose.fast.yml"
    MEMORY_MODE="fast"
fi

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리..."
docker-compose -f $COMPOSE_FILE down --remove-orphans 2>/dev/null || true

# 사용하지 않는 Docker 객체 정리
echo "🗑️  Docker 정리..."
docker system prune -f --volumes

# 스왑 메모리 활성화 (EC2 t2.micro 등)
if [ "$TOTAL_MEM" -lt 1024 ]; then
    echo "💾 스왑 메모리 설정 확인..."
    if ! swapon --show | grep -q "/swapfile"; then
        echo "스왑 파일을 생성합니다..."
        sudo fallocate -l 1G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1024 count=1048576
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab
        echo "✅ 스왑 메모리 활성화 완료"
    else
        echo "✅ 스왑 메모리가 이미 활성화되어 있습니다."
    fi
fi

# 환경 변수 로드
source .env.prod

# 빌드 전 메모리 최적화
echo "🔧 시스템 최적화..."
# 캐시 정리
sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null

if [ "$MEMORY_MODE" = "ultra" ]; then
    echo "🔥 극한 최적화 모드로 빌드 시작..."
    
    # 메모리 최적화를 위한 커널 파라미터 조정
    echo "🔧 커널 파라미터 최적화..."
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
    echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
    
    # 단계별 빌드 (메모리 절약)
    echo "1️⃣ PostgreSQL 먼저 시작..."
    docker-compose -f $COMPOSE_FILE up -d postgres
    
    # PostgreSQL 완전히 준비될 때까지 대기
    echo "⏳ PostgreSQL 초기화 대기 (최대 2분)..."
    timeout 120 bash -c 'until docker exec nextbill-postgres-ultra pg_isready -U ${DB_USER:-nextbill_user} -d ${DB_NAME:-nextbill} >/dev/null 2>&1; do 
        echo "PostgreSQL 초기화 중..."
        sleep 5
    done'
    
    if [ $? -ne 0 ]; then
        echo "❌ PostgreSQL 시작 실패. 로그 확인:"
        docker logs nextbill-postgres-ultra
        echo "💡 해결 방법:"
        echo "1. 메모리 부족: 더 큰 인스턴스 사용"
        echo "2. 볼륨 문제: docker volume prune -f 실행"
        echo "3. 권한 문제: sudo chown -R 999:999 /var/lib/docker/volumes/"
        exit 1
    fi
    
    echo "✅ PostgreSQL 준비 완료!"
    
    echo "2️⃣ Redis 시작..."
    docker-compose -f $COMPOSE_FILE up -d redis
    sleep 5
    
    echo "3️⃣ Zookeeper 시작..."
    docker-compose -f $COMPOSE_FILE up -d zookeeper
    sleep 10
    
    echo "4️⃣ Kafka 시작..."
    docker-compose -f $COMPOSE_FILE up -d kafka
    
    # Kafka 준비 대기
    echo "⏳ Kafka 준비 대기..."
    sleep 20
    
    echo "5️⃣ 백엔드 빌드 및 시작..."
    docker-compose -f $COMPOSE_FILE up -d backend
    
    # 백엔드 준비 대기
    echo "⏳ 백엔드 준비 대기..."
    timeout 180 bash -c 'until docker exec nextbill-backend-ultra curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; do 
        echo "백엔드 시작 중..."
        sleep 10
    done'
    
    if [ $? -ne 0 ]; then
        echo "❌ 백엔드 시작 실패. 로그 확인:"
        docker logs nextbill-backend-ultra
        exit 1
    fi
    
    echo "✅ 백엔드 준비 완료!"
    
    echo "6️⃣ 프론트엔드 빌드 및 시작..."
    # 메모리 부족 대비 재시도 로직
    for i in {1..3}; do
        echo "프론트엔드 빌드 시도 $i/3..."
        if docker-compose -f $COMPOSE_FILE up -d frontend; then
            echo "✅ 프론트엔드 빌드 성공!"
            break
        else
            echo "❌ 프론트엔드 빌드 실패. 메모리 정리 후 재시도..."
            docker system prune -f
            sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1
            sleep 10
            if [ $i -eq 3 ]; then
                echo "💥 프론트엔드 빌드 3회 실패."
                echo "💡 대안 방법:"
                echo "1. 로컬 빌드: ./scripts/local-build-deploy.sh"
                echo "2. 개발 서버: docker-compose -f docker-compose.fast.yml up -d"
                echo "3. 인스턴스 업그레이드: t2.small 이상 권장"
                
                # 백엔드만으로도 API 서버는 동작하므로 계속 진행
                echo "🔄 백엔드만으로 API 서버 운영을 계속합니다..."
                break
            fi
        fi
    done
    
    echo "7️⃣ Nginx 프록시 시작..."
    docker-compose -f $COMPOSE_FILE up -d nginx
    
else
    echo "⚡ 고속 최적화 모드로 빌드 시작..."
    docker-compose -f $COMPOSE_FILE up -d
fi

# 서비스 상태 확인
echo "🔍 서비스 상태 확인..."
sleep 10

# 헬스체크
check_service() {
    local service=$1
    local url=$2
    local timeout=${3:-30}
    
    echo -n "  $service: "
    if timeout $timeout bash -c "until curl -f $url >/dev/null 2>&1; do sleep 2; done"; then
        echo "✅ 정상"
    else
        echo "❌ 실패"
        return 1
    fi
}

echo "📋 헬스체크 실행..."
check_service "Frontend" "http://localhost" 60
check_service "Backend" "http://localhost/api/actuator/health" 30
check_service "Database" "http://localhost/api/actuator/health" 30

# 서비스 로그 확인
echo "📜 서비스 로그 (최근 20줄):"
echo "--- 백엔드 로그 ---"
docker-compose -f $COMPOSE_FILE logs --tail=20 backend

echo "--- 프론트엔드 로그 ---"
docker-compose -f $COMPOSE_FILE logs --tail=20 frontend

# 메모리 사용량 확인
echo "📊 현재 메모리 사용량:"
free -h
echo ""
echo "🐳 Docker 컨테이너 상태:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo ""
echo "🎉 NextBill Ultra 최적화 배포 완료!"
echo "🌐 서비스 접속: http://$(curl -s ifconfig.me || echo 'YOUR_SERVER_IP')"
echo ""
echo "💡 유용한 명령어:"
echo "  - 로그 확인: docker-compose -f $COMPOSE_FILE logs -f [서비스명]"
echo "  - 재시작: docker-compose -f $COMPOSE_FILE restart [서비스명]"
echo "  - 중지: docker-compose -f $COMPOSE_FILE down"
echo "  - 완전 정리: docker-compose -f $COMPOSE_FILE down --volumes --remove-orphans && docker system prune -af"
