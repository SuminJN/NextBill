#!/bin/bash

# NextBill 사전 빌드된 파일로 배포 스크립트
# 로컬에서 빌드된 파일을 사용하여 서버에서 배포

set -e

echo "📦 사전 빌드된 파일로 NextBill 배포 시작..."

# 환경 변수 확인
if [ ! -f ".env.prod" ]; then
    echo "❌ .env.prod 파일이 없습니다."
    exit 1
fi

# 빌드 파일 확인
if [ ! -f "frontend-dist.tar.gz" ]; then
    echo "❌ frontend-dist.tar.gz 파일이 없습니다."
    echo "먼저 로컬에서 빌드하고 파일을 업로드해주세요."
    exit 1
fi

# 1. 빌드 파일 압축 해제
echo "📂 빌드 파일 압축 해제..."
rm -rf frontend/dist
mkdir -p frontend/dist
tar -xzf frontend-dist.tar.gz -C frontend/dist/

# 2. 사전 빌드용 Dockerfile 생성
echo "🐳 사전 빌드용 Dockerfile 생성..."
cat > frontend/Dockerfile.prebuilt << 'EOF'
FROM nginx:alpine

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 사전 빌드된 파일 복사
COPY dist /usr/share/nginx/html

# 권한 설정
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

# 3. 사전 빌드용 docker-compose 파일 생성
echo "⚙️  사전 빌드용 docker-compose 설정..."
cat > docker-compose.prebuilt.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: nextbill-postgres
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - nextbill-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: nextbill-redis
    networks:
      - nextbill-network

  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    container_name: nextbill-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    networks:
      - nextbill-network

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    container_name: nextbill-kafka
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    depends_on:
      - zookeeper
    networks:
      - nextbill-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nextbill-backend
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/${DB_NAME}
      - SPRING_DATASOURCE_USERNAME=${DB_USER}
      - SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
      - SPRING_REDIS_HOST=redis
      - SPRING_REDIS_PORT=6379
      - SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:9092
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GOOGLE_REDIRECT_URI=${GOOGLE_REDIRECT_URI}
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
      - BACKEND_URL=${BACKEND_URL}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - nextbill-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: frontend
      dockerfile: Dockerfile.prebuilt
    container_name: nextbill-frontend
    depends_on:
      - backend
    ports:
      - "80:80"
    networks:
      - nextbill-network

networks:
  nextbill-network:
    driver: bridge

volumes:
  postgres_data:
EOF

# 4. 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리..."
docker-compose -f docker-compose.prebuilt.yml down --remove-orphans 2>/dev/null || true

# 5. 환경 변수 로드 및 배포
echo "🚀 사전 빌드된 파일로 배포 시작..."
source .env.prod
docker-compose -f docker-compose.prebuilt.yml up -d

# 6. 서비스 확인
echo "⏳ 서비스 시작 대기..."
sleep 30

echo "🔍 서비스 상태 확인..."
docker-compose -f docker-compose.prebuilt.yml ps

# 헬스체크
echo "📋 헬스체크..."
timeout 60 bash -c 'until curl -f http://localhost >/dev/null 2>&1; do echo "대기중..."; sleep 5; done' && echo "✅ 프론트엔드 정상" || echo "❌ 프론트엔드 실패"
timeout 60 bash -c 'until curl -f http://localhost/api/actuator/health >/dev/null 2>&1; do echo "대기중..."; sleep 5; done' && echo "✅ 백엔드 정상" || echo "❌ 백엔드 실패"

echo "🎉 사전 빌드된 파일로 배포 완료!"
echo "🌐 서비스 접속: http://$(curl -s ifconfig.me || echo 'YOUR_SERVER_IP')"

# 임시 파일 정리
rm -f frontend-dist.tar.gz
