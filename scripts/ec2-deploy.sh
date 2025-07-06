#!/bin/bash

# NextBill EC2 직접 배포 스크립트
# 메모리 부족 환경에서 안전하게 실행

set -e

echo "🚀 NextBill EC2 직접 배포 시작..."

# 환경 변수 확인
if [ ! -f ".env.prod" ]; then
    echo "❌ .env.prod 파일이 없습니다. 환경 변수를 설정합니다..."
    
    # 기본 환경 변수 생성
    cat > .env.prod << 'EOF'
DB_NAME=nextbill
DB_USER=nextbill_user
DB_PASSWORD=nextbill_secure_password_2024
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=nextbill_jwt_secret_key_very_long_and_secure_2024_production
SPRING_PROFILES_ACTIVE=docker
EOF
    
    # 서버 IP 자동 설정
    SERVER_IP=$(curl -s ifconfig.me)
    echo "GOOGLE_REDIRECT_URI=http://$SERVER_IP/oauth2/code/google" >> .env.prod
    echo "FRONTEND_URL=http://$SERVER_IP" >> .env.prod
    echo "BACKEND_URL=http://$SERVER_IP/api" >> .env.prod
    
    echo "✅ 기본 환경 변수 생성 완료"
    echo "⚠️  Google OAuth2 설정을 위해 .env.prod 파일을 편집해주세요!"
fi

# 메모리 확인
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
echo "📊 시스템 메모리: ${TOTAL_MEM}MB"

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리..."
docker-compose -f docker-compose.fast.yml down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.ultra.yml down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

# Docker 정리
echo "🗑️  Docker 정리..."
docker system prune -f

# 환경 변수 로드
source .env.prod

if [ "$TOTAL_MEM" -lt 1024 ]; then
    echo "⚠️  메모리가 1GB 미만입니다. 최소 구성으로 배포합니다."
    
    # 스왑 메모리 확인/생성
    if ! swapon --show | grep -q "/swapfile"; then
        echo "💾 스왑 메모리 생성..."
        sudo fallocate -l 1G /swapfile 2>/dev/null || sudo dd if=/dev/zero of=/swapfile bs=1024 count=1048576
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        echo "✅ 스왑 메모리 활성화"
    fi
    
    # 메모리 캐시 정리
    sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null
    
    # 최소 구성 docker-compose 생성
    cat > docker-compose.minimal.yml << 'EOF'
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: nextbill-mysql-minimal
    environment:
      - MYSQL_ROOT_PASSWORD=nextbill50913nrt0cai0vij0239h
      - MYSQL_DATABASE=nextbill
      - MYSQL_USER=nextbill_user
      - MYSQL_PASSWORD=nextbill50913nrt0cai0vij0239h
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - nextbill-network
    command: --default-authentication-plugin=mysql_native_password --innodb-buffer-pool-size=64M --max-connections=50
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "nextbill_user", "-pnextbill50913nrt0cai0vij0239h"]
      interval: 15s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: nextbill-redis-minimal
    command: redis-server --maxmemory 32mb --maxmemory-policy allkeys-lru
    networks:
      - nextbill-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nextbill-backend-minimal
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/nextbill?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
      - SPRING_DATASOURCE_USERNAME=nextbill_user
      - SPRING_DATASOURCE_PASSWORD=nextbill50913nrt0cai0vij0239h
      - SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver
      - SPRING_REDIS_HOST=redis
      - SPRING_REDIS_PORT=6379
      - JWT_SECRET=nfk19nf01of13ifnszkdnmcozmdkmh024mn12mfsolzx
      - GOOGLE_CLIENT_ID=913887840289-80j2qte7l14it64q2t30o827dum32ml2.apps.googleusercontent.com
      - GOOGLE_CLIENT_SECRET=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
      - JAVA_OPTS=-Xmx256m -Xms128m -XX:+UseSerialGC
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - nextbill-network
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 60s
      timeout: 30s
      retries: 3

  frontend:
    image: nginx:alpine
    container_name: nextbill-frontend-minimal
    volumes:
      - ./frontend/public:/usr/share/nginx/html
      - ./nginx-simple.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - nextbill-network

networks:
  nextbill-network:
    driver: bridge

volumes:
  mysql_data:
EOF

    # 간단한 nginx 설정
    cat > nginx-simple.conf << 'EOF'
events {
    worker_connections 256;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        location /api/ {
            proxy_pass http://backend:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
EOF

    echo "🚀 최소 구성으로 배포 시작..."
    
    # 단계별 배포
    echo "1️⃣ MySQL 시작..."
    docker-compose -f docker-compose.minimal.yml up -d mysql
    sleep 20
    
    echo "2️⃣ Redis 시작..."
    docker-compose -f docker-compose.minimal.yml up -d redis
    sleep 10
    
    echo "3️⃣ 백엔드 빌드 및 시작..."
    docker-compose -f docker-compose.minimal.yml up -d backend
    sleep 60
    
    echo "4️⃣ 프론트엔드 시작..."
    docker-compose -f docker-compose.minimal.yml up -d frontend
    
    COMPOSE_FILE="docker-compose.minimal.yml"
    
else
    echo "✅ 메모리 충분. 일반 배포 모드로 진행..."
    COMPOSE_FILE="docker-compose.fast.yml"
    docker-compose -f $COMPOSE_FILE up -d
fi

echo "⏳ 서비스 시작 대기..."
sleep 30

# 서비스 상태 확인
echo "🔍 서비스 상태 확인..."
docker-compose -f $COMPOSE_FILE ps

echo "📋 헬스체크..."
timeout 60 bash -c 'until curl -f http://localhost >/dev/null 2>&1; do echo "프론트엔드 대기중..."; sleep 5; done' && echo "✅ 프론트엔드 정상" || echo "❌ 프론트엔드 확인 필요"

if [ "$TOTAL_MEM" -gt 512 ]; then
    timeout 60 bash -c 'until curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; do echo "백엔드 대기중..."; sleep 5; done' && echo "✅ 백엔드 정상" || echo "❌ 백엔드 확인 필요"
fi

echo ""
echo "🎉 NextBill 배포 완료!"
echo "🌐 서비스 접속: http://$(curl -s ifconfig.me)"
echo ""
echo "💡 유용한 명령어:"
echo "  - 전체 로그: docker-compose -f $COMPOSE_FILE logs -f"
echo "  - 백엔드 로그: docker-compose -f $COMPOSE_FILE logs -f backend"
echo "  - 서비스 재시작: docker-compose -f $COMPOSE_FILE restart"
echo "  - 완전 정리: docker-compose -f $COMPOSE_FILE down --volumes"
