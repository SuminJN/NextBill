# NextBill

**NextBill**는 사용자가 구독 서비스를 효율적으로 관리하고, 결제일에 맞춰 알림을 받을 수 있도록 도와주는 B2C 금융 알림 서비스입니다.  
주요 기능은 구독 정보 등록 및 관리, 결제일 알림 전송이며, 이메일 알림 수신 여부를 사용자 선택에 따라 설정할 수 있습니다.

---

## ⚡ 빠른 시작

### 1. 환경변수 설정

`.env.example` 파일을 `.env`로 복사
```bash
cp .env.example .env
```

`.env` 파일에서 실제 값으로 수정
```bash
# 이메일 발송 설정
NEXTBILL_EMAIL_USERNAME=your-email@gmail.com
NEXTBILL_EMAIL_PASSWORD=your-app-password

# Google OAuth2 설정
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. Google OAuth2 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "APIs & Services" > "Credentials" 이동
4. "Create Credentials" > "OAuth 2.0 Client IDs" 선택
5. 애플리케이션 유형: "Web application" 선택
6. 승인된 리디렉션 URI 추가:
   - `http://localhost:8080/login/oauth2/code/google`
7. Client ID와 Client Secret을 `.env` 파일에 추가

### 3. 실행 방법

백엔드 실행
```bash
./gradlew bootRun
```

프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```

### 보안 고려사항

- 테스트 API는 개발 환경(local profile)에서만 활성화됩니다
- 이메일 비밀번호는 환경변수를 통해 관리됩니다
- 실제 Gmail 앱 비밀번호를 사용해야 합니다
- Google OAuth2를 통한 안전한 로그인 지원

---

## 프로젝트 개요

- **타겟 사용자**: 정기적으로 서비스를 구독하는 일반 사용자
- **문제 인식**: 다양한 구독 서비스로 인한 결제 관리의 어려움
- **해결 방안**: 구독 정보를 하나로 통합 관리하고, 결제일에 맞춰 알림 제공

---

## 주요 기능

### 사용자 기능

- 회원가입 및 로그인 (JWT 기반 인증 처리)
- 구독 정보 등록 (서비스명, 금액, 주기, 다음 결제일)
- 구독 정보 수정 및 삭제
- 구독 정보 일시 정지 및 재활성화
- 이메일 알림 수신 여부 설정

### 알림 기능

- Kafka 기반 알림 스케줄링 (D-Day 기준)
- 이메일 알림 전송 (선택 수신 가능)
- 알림 전송 상태 저장 및 관리 (Redis 캐시 활용)

---

## 시스템 아키텍처

- **Backend**: Spring Boot
- **Database**: MySQL
- **Cache**: Redis
- **Message Queue**: Kafka
- **Authentication**: JWT (Access Token + Refresh Token)
- **Frontend**: 간단한 React SPA (MVP 이후 개발 예정)

---

## ERD (Entity Relationship Diagram)

![NextBill (3)](https://github.com/user-attachments/assets/6577b985-095b-4edd-8e58-01309f7b1b7d)

### 주요 테이블 설명

#### users

| 필드명 | 설명 |
|--------|------|
| email | 사용자 이메일 (로그인 ID) |
| password | 비밀번호 (암호화 저장) |
| is_email_alert_enabled | 이메일 알림 수신 여부 |
| created_at / updated_at | 생성/수정 시각 |

#### subscriptions

| 필드명 | 설명 |
|--------|------|
| user_id | 사용자 ID (FK) |
| name | 구독 서비스명 |
| cost | 구독 금액 |
| billing_cycle | 연/월/주/사용자정의 주기 |
| next_payment_date | 다음 결제일 |
| is_paused | 일시 정지 여부 |
| deleted_at | 삭제 처리 시각 (soft delete) |

#### alert_statuses

| 필드명 | 설명 |
|--------|------|
| subscription_id | 구독 ID (FK) |
| alert_date | 알림 예정일 |
| alert_type | 알림 종류 (D-7, D-3 등) |
| is_sent | 전송 성공 여부 |
| sent_at | 실제 전송 시각 |

---

## 사용 기술 스택

- **Java 17**, **Spring Boot 3**
- **JPA (Hibernate)**, **Spring Data JDBC**
- **Kafka** (알림 이벤트 큐)
- **Redis** (구독 및 알림 정보 캐싱)
- **JWT** (인증 및 토큰 관리)
- **JUnit + Mockito** (테스트)

---

## 향후 계획

- 사용자별 구독 요약 대시보드 제공
- SMS 알림 기능 확장
- 외부 구독 서비스 API 연동 (Netflix, YouTube 등)
