# NextBill

## [📌 ~~서비스 바로가기~~](https://my.nextbill.o-r.kr) 배포 중단

**NextBill**은 구독 서비스의 복잡한 결제 일정을 한 곳에서 관리할 수 있는 스마트한 구독 관리 플랫폼입니다.  
Google OAuth2 기반의 안전한 로그인과 개인 맞춤형 알림 시스템을 통해 구독 결제를 놓치지 않도록 도와드립니다.

<div align="center">

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![Redis](https://img.shields.io/badge/Redis-7.0-red)
![Kafka](https://img.shields.io/badge/Kafka-3.0-black)
![React](https://img.shields.io/badge/React-18-blue)

</div>

---

![Group 1](https://github.com/user-attachments/assets/4f2e50b2-4f6b-436a-a39e-3559e6d51099)

![Group 2](https://github.com/user-attachments/assets/39c3bd3c-3a70-4f4f-b65f-4d91d788aa88)

---

## 🚀 프로젝트 개요

### 문제 정의
- 다양한 구독 서비스로 인한 결제 관리의 복잡성
- 예상치 못한 결제로 인한 재정 관리의 어려움
- 구독 서비스별로 흩어진 결제 정보

### 해결 방안
- **통합 구독 관리**: 모든 구독 서비스를 한 곳에서 관리
- **스마트 알림 시스템**: D-7, D-3, D-1, D-Day 맞춤형 알림
- **직관적인 대시보드**: 구독 현황을 한눈에 파악

### 타겟 사용자
- 여러 구독 서비스를 이용하는 개인 사용자
- 효율적인 가계부 관리를 원하는 사용자
- 결제 일정 관리가 필요한 소상공인

---

## ✨ 주요 기능

### 인증 시스템
- **Google OAuth2 로그인**: 안전하고 빠른 소셜 로그인
- **JWT 토큰 관리**: Access Token + Refresh Token 구조
- **자동 토큰 갱신**: 사용자 경험 개선

### 구독 관리
- **구독 등록/수정/삭제**: 직관적인 CRUD 작업
- **일시정지/재개**: 유연한 구독 상태 관리
- **결제 주기 설정**: 월간/연간/주간/사용자 정의

### 알림 시스템
- **단계별 알림**: D-7, D-3, D-1, D-Day 알림
- **개인 맞춤 설정**: 알림 유형별 on/off 설정
- **자동 결제일 업데이트**: 결제 완료 후 자동 갱신

### 대시보드
- **월별 지출 현황**: 구독 비용 통계
- **다가오는 결제**: 우선순위별 결제 일정
- **구독 현황 요약**: 활성/일시정지 구독 통계

---

## 🛠 기술 스택

### Frontend

| 분야 | 기술 스택 | 설명 |
|------|-----------|------|
| **언어 & 프레임워크** | JavaScript, React 18 | 모던 프론트엔드 프레임워크 |
| **UI 라이브러리** | Material-UI (MUI) | Google Material Design |
| **상태 관리** | React Context API | 전역 상태 관리 |
| **라우팅** | React Router v6 | SPA 라우팅 |
| **HTTP 클라이언트** | Axios | API 통신 |
| **빌드 도구** | Vite | 빠른 개발 서버 및 빌드 |
| **알림** | React Hot Toast | 사용자 알림 |
| **테마** | Custom Theme Context | 다크/라이트 모드 |

### Backend

| 분야 | 기술 스택 | 설명 |
|------|-----------|------|
| **언어 & 프레임워크** | Java 17, Spring Boot 3.5 | 최신 Java 기능과 Spring Boot 활용 |
| **데이터베이스** | MySQL 8.0 | 관계형 데이터베이스 |
| **캐싱** | Redis 7.0 | 세션 관리 및 임시 데이터 저장 |
| **메시지 큐** | Apache Kafka 3.0 | 비동기 알림 처리 |
| **ORM** | Spring Data JPA | 객체-관계 매핑 |
| **인증** | Spring Security + OAuth2 | Google OAuth2 인증 |
| **이메일** | Spring Mail | SMTP 기반 이메일 발송 |
| **스케줄링** | Spring Scheduler | 자동 알림 및 결제일 업데이트 |
| **테스트** | JUnit 5, Mockito | 단위 테스트 및 Mock |
| **API 문서** | SpringDoc OpenAPI 3 | Swagger UI 자동 생성 |

### DevOps & Tools

| 분야 | 기술 스택 | 설명 |
|------|-----------|------|
| **빌드 도구** | Gradle | Java 프로젝트 빌드 |
| **패키지 매니저** | npm | Node.js 패키지 관리 |
| **환경 변수** | dotenv-java | 환경 설정 관리 |
| **컨테이너** | Docker Compose | 개발 환경 구성 |

---

## 🏗 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │  Spring Boot    │    │     MySQL       │
│                 │◄──►│                 │◄──►│                 │
│  - Material-UI  │    │  - REST API     │    │  - 구독 데이터     │
│  - OAuth2 Login │    │  - JWT Auth     │    │  - 사용자 정보     │
│  - 실시간 알림     │    │  - JPA/Hibernate│    │  - 알림 이력      │
└─────────────────┘    └─────────┬───────┘    └─────────────────┘
                                 │
                       ┌─────────┼─────────┐
                       │                   │
                       ▼                   ▼
           ┌─────────────────┐    ┌─────────────────┐
           │     Redis       │    │     Kafka       │
           │                 │    │                 │
           │  - 세션 저장      │    │  - 알림 이벤트     │
           │  - 토큰 캐시      │    │  - 비동기 처리     │
           │  - 임시 데이터     │    │  - 이메일 큐      │
           └─────────────────┘    └─────────────────┘
```

---

## 📊 데이터베이스 설계

### ERD (Entity Relationship Diagram)

![NextBill](https://github.com/user-attachments/assets/124086eb-30d8-4f53-bcf0-a285b8e40588)

### 주요 테이블

#### users
| 필드명 | 타입 | 설명 |
|--------|------|------|
| user_id | BIGINT | 사용자 고유 ID (PK) |
| email | VARCHAR(100) | 이메일 주소 (UK) |
| password | VARCHAR(100) | 암호화된 비밀번호 |
| is_email_alert_enabled | BOOLEAN | 전체 이메일 알림 설정 |
| email_alert_7days | BOOLEAN | 7일 전 알림 설정 |
| email_alert_3days | BOOLEAN | 3일 전 알림 설정 |
| email_alert_1day | BOOLEAN | 1일 전 알림 설정 |
| email_alert_dday | BOOLEAN | D-Day 알림 설정 |

#### subscriptions
| 필드명 | 타입 | 설명 |
|--------|------|------|
| subscription_id | BIGINT | 구독 고유 ID (PK) |
| user_id | BIGINT | 사용자 ID (FK) |
| name | VARCHAR(100) | 구독 서비스명 |
| cost | INTEGER | 구독 비용 |
| billing_cycle | ENUM | 결제 주기 (MONTHLY, YEARLY, WEEKLY, CUSTOM) |
| start_date | DATE | 구독 시작일 |
| next_payment_date | DATE | 다음 결제일 |
| is_paused | BOOLEAN | 일시정지 여부 |
| deleted_at | DATETIME | 삭제 시각 (Soft Delete) |

#### alert_statuses
| 필드명 | 타입 | 설명 |
|--------|------|------|
| alert_status_id | BIGINT | 알림 고유 ID (PK) |
| subscription_id | BIGINT | 구독 ID (FK) |
| alert_type | ENUM | 알림 유형 (D_7, D_3, D_1, D_DAY) |
| alert_date | DATE | 알림 예정일 |
| is_sent | BOOLEAN | 전송 성공 여부 |
| sent_at | DATETIME | 실제 전송 시각 |

#### notifications
| 필드명 | 타입 | 설명 |
|--------|------|------|
| notification_id | BIGINT | 알림 고유 ID (PK) |
| user_id | BIGINT | 사용자 ID (FK) |
| subscription_id | BIGINT | 구독 ID (FK, 선택적) |
| message | VARCHAR(500) | 알림 메시지 내용 |
| type | ENUM | 알림 유형 (NotificationType) |
| priority | ENUM | 알림 우선순위 (NotificationPriority) |
| is_read | BOOLEAN | 읽음 여부 |
| read_at | DATETIME | 읽은 시각 |
| days_until | INTEGER | 결제일까지 남은 일수 |
| created_at | DATETIME | 생성 시각 |
| updated_at | DATETIME | 수정 시각 |

---

## 🔄 API 문서

### 인증 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/api/auth/refresh` | 토큰 갱신 |
| `POST` | `/api/auth/logout` | 로그아웃 |
| `GET` | `/api/auth/me` | 현재 사용자 정보 조회 |
| `POST` | `/api/auth/complete-registration` | 신규 사용자 등록 완성 |

### 사용자 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/users/{userId}` | 사용자 정보 조회 |
| `PATCH` | `/api/users/{userId}/email-alert` | 이메일 알림 설정 변경 |
| `GET` | `/api/users/{userId}/email-settings` | 이메일 알림 설정 조회 |
| `PUT` | `/api/users/{userId}/email-settings` | 이메일 알림 설정 업데이트 |
| `DELETE` | `/api/users/{userId}` | 계정 삭제 |

### 구독 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/subscriptions/user/{userId}` | 사용자별 구독 목록 조회 |
| `POST` | `/api/subscriptions` | 구독 생성 |
| `PUT` | `/api/subscriptions/{subscriptionId}` | 구독 수정 |
| `DELETE` | `/api/subscriptions/{subscriptionId}` | 구독 삭제 |
| `PATCH` | `/api/subscriptions/{subscriptionId}/pause` | 구독 일시정지/재개 |

---

## 🤝 기여하기

1. 이 저장소를 Fork 합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push 합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

---

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 언제든지 연락해 주세요:

- **이메일**: nextbill.kr@gmail.com, wjstnals1211@gmail.com
- **GitHub**: [NextBill Repository](https://github.com/suminjn/NextBill)
