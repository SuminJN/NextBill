#!/bin/bash

echo "🚀 NextBill 빠른 배포 스크립트"

# 1. 프론트엔드 로컬 빌드 (훨씬 빠름)
echo "📦 프론트엔드 로컬 빌드 중..."
cd frontend
npm install
npm run build
cd ..

# 2. 빌드된 파일을 간단한 nginx 컨테이너로 서빙
echo "🌐 nginx 컨테이너 준비 중..."
mkdir -p temp-deploy/frontend
cp -r frontend/dist/* temp-deploy/frontend/

# 3. 간단한 nginx 설정
cat > temp-deploy/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 3000;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

# 4. 간단한 Dockerfile
cat > temp-deploy/Dockerfile.frontend << 'EOF'
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY frontend /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
EOF

echo "✅ 빠른 배포 준비 완료!"
echo ""
echo "🚀 EC2에서 다음 명령어 실행:"
echo "1. rsync -av temp-deploy/ ubuntu@your-ec2:/home/ubuntu/NextBill/temp-deploy/"
echo "2. docker build -t nextbill-frontend:fast -f temp-deploy/Dockerfile.frontend temp-deploy/"
echo "3. docker-compose -f docker-compose.fast.yml up -d"
