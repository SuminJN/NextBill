#!/bin/bash

# SSL 인증서 갱신 스크립트

echo "🔄 SSL 인증서 갱신을 시작합니다..."

# 1. 인증서 갱신
echo "📜 인증서 갱신 중..."
sudo certbot renew --quiet

if [ $? -eq 0 ]; then
    echo "✅ 인증서가 성공적으로 갱신되었습니다!"
    
    # 2. nginx 재시작 (Docker 환경)
    if command -v docker-compose &> /dev/null; then
        echo "🔄 nginx 컨테이너 재시작 중..."
        docker-compose -f docker-compose-prod.yml restart nginx
    # 시스템 nginx 재시작
    elif command -v systemctl &> /dev/null; then
        echo "🔄 nginx 서비스 재시작 중..."
        sudo systemctl reload nginx
    elif command -v service &> /dev/null; then
        echo "🔄 nginx 서비스 재시작 중..."
        sudo service nginx reload
    fi
    
    echo "✅ SSL 인증서 갱신이 완료되었습니다!"
else
    echo "❌ SSL 인증서 갱신에 실패했습니다."
    exit 1
fi
