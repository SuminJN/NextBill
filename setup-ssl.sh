#!/bin/bash

# SSL 설정 스크립트
# 사용법: ./setup-ssl.sh [IP주소 또는 도메인명]

DOMAIN=${1:-13.124.61.42}
EMAIL="admin@example.com"

echo "🔒 ${DOMAIN}에 대한 SSL 인증서를 설정합니다..."

# 1. Certbot 설치
echo "📦 Certbot 설치 중..."
if command -v apt-get &> /dev/null; then
    # Ubuntu/Debian
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
elif command -v yum &> /dev/null; then
    # CentOS/RHEL
    sudo yum install -y epel-release
    sudo yum install -y certbot python3-certbot-nginx
elif command -v brew &> /dev/null; then
    # macOS
    brew install certbot
else
    echo "❌ 지원되지 않는 운영체제입니다."
    exit 1
fi

# 2. 방화벽 설정 (필요한 경우)
echo "🔥 방화벽 포트 확인 중..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 'Nginx Full'
    sudo ufw allow ssh
elif command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
fi

# 3. nginx 중지 (인증서 발급을 위해)
echo "⏹️  nginx 서비스 중지 중..."
if command -v systemctl &> /dev/null; then
    sudo systemctl stop nginx
elif command -v service &> /dev/null; then
    sudo service nginx stop
fi

# Docker 환경인 경우 컨테이너 중지
if command -v docker &> /dev/null; then
    echo "🐳 Docker 컨테이너 중지 중..."
    docker-compose -f docker-compose-prod.yml down
fi

# 4. Let's Encrypt 인증서 발급
echo "📜 Let's Encrypt 인증서 발급 중..."
sudo certbot certonly --standalone -d ${DOMAIN} --non-interactive --agree-tos --email ${EMAIL}

if [ $? -eq 0 ]; then
    echo "✅ SSL 인증서가 성공적으로 발급되었습니다!"
    
    # 5. nginx 설정 업데이트
    echo "⚙️  nginx 설정을 업데이트합니다..."
    
    # 도메인명을 nginx 설정에 반영
    sed -i.bak "s/your-domain.com/${DOMAIN}/g" nginx/nginx.conf
    sed -i "s/server_name localhost;/server_name ${DOMAIN};/g" nginx/nginx.conf
    
    # SSL 설정 활성화
    sed -i 's/# server {/server {/g' nginx/nginx.conf
    sed -i 's/#     listen 443/    listen 443/g' nginx/nginx.conf
    sed -i 's/#     server_name/    server_name/g' nginx/nginx.conf
    sed -i 's/#     ssl_/    ssl_/g' nginx/nginx.conf
    sed -i 's/#     add_header/    add_header/g' nginx/nginx.conf
    sed -i 's/# }/}/g' nginx/nginx.conf
    
    # 인증서 경로 설정
    sed -i "s|/etc/nginx/ssl/cert.pem|/etc/letsencrypt/live/${DOMAIN}/fullchain.pem|g" nginx/nginx.conf
    sed -i "s|/etc/nginx/ssl/key.pem|/etc/letsencrypt/live/${DOMAIN}/privkey.pem|g" nginx/nginx.conf
    
    # HTTP에서 HTTPS로 리다이렉트 활성화
    sed -i 's/# server {/server {/1' nginx/nginx.conf
    sed -i 's/#     listen 80;/    listen 80;/1' nginx/nginx.conf
    sed -i 's/#     server_name/    server_name/1' nginx/nginx.conf
    sed -i 's/#     return 301/    return 301/1' nginx/nginx.conf
    sed -i 's/# }/}/1' nginx/nginx.conf
    
    echo "✅ nginx 설정이 업데이트되었습니다!"
    
    # 6. 자동 갱신 설정
    echo "🔄 인증서 자동 갱신 설정 중..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    echo "🎉 SSL 설정이 완료되었습니다!"
    echo ""
    echo "📋 설정 정보:"
    echo "  - 도메인: ${DOMAIN}"
    echo "  - 인증서 위치: /etc/letsencrypt/live/${DOMAIN}/"
    echo "  - 자동 갱신: 매일 12시에 실행됩니다"
    echo ""
    echo "🚀 다음 단계:"
    echo "  1. docker-compose-prod.yml에서 nginx 볼륨 마운트 확인"
    echo "  2. 'docker-compose -f docker-compose-prod.yml up -d' 실행"
    echo "  3. https://${DOMAIN} 에서 접속 확인"
    
else
    echo "❌ SSL 인증서 발급에 실패했습니다."
    echo "다음을 확인해주세요:"
    echo "  - 도메인이 이 서버의 IP를 가리키는지 확인"
    echo "  - 80포트가 열려있는지 확인"
    echo "  - 방화벽 설정 확인"
    exit 1
fi
