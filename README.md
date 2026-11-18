# EasyTerms React 프론트엔드

React 19 + Vite 8 기반의 EasyTerms 실제 API 연동 프론트엔드입니다.

## 1. 실행 준비

Node.js 20.19+ 또는 22.12+ 버전이 필요합니다. Spring Boot 백엔드는 `http://localhost:8080`에서 실행해야 합니다.

```bash
cd easyterms-frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`에 접속합니다.

## 2. 로컬 API 연결

`vite.config.js`의 `/api` 프록시가 `http://localhost:8080`으로 요청을 전달합니다.
로컬에서 `VITE_API_BASE_URL`을 설정하지 마세요. 백엔드 CORS 설정이 없어도 개발 중 테스트가 가능합니다.

## 3. 기능 동선

1. `/register`: 회원가입 (이메일·비밀번호·닉네임)
2. `/login`: 로그인 → JWT 발급 및 `/api/auth/me` 검증
3. `/upload`: PDF/TXT 최대 5MB 업로드 후 GPT-6 Luna 분석
4. `/documents/:id`: 쉬운 설명·핵심 조건·확인할 사항·용어·원문 근거
5. `/documents/:id/chat`: 원문+이전 10개 채팅 메시지를 이용하는 후속 질문
6. `/documents`: 로그인 사용자 문서 목록

### Postman에서 검증한 사용자 2번 문서 6번 바로 확인하기

이전에 `easytest1@example.com` 테스트 유저로 로그인하여 실행합니다.
`http://localhost:5173/documents/6`에서 분석 결과를 확인합니다.
`http://localhost:5173/documents/6/chat`에서 기존 채팅 14개를 확인합니다.

## 4. 서버 API 요청 형식

| 기능 | 메서드 | 경로 | 본문 |
| ---- | ---- | ---- | ---- |
| 로그인 | POST | /api/auth/login | JSON `{email,password}` |
| 회원가입 | POST | /api/auth/register | JSON `{email,password,nickname}` |
| 내 정보 | GET | /api/auth/me | `Authorization: Bearer JWT` |
| 업로드 | POST | /api/documents/upload | form-data `userId,title,documentType,file` |
| 분석 실행 | POST | /api/analysis/{id}?userId={id} | 없음 |
| 분석 조회 | GET | /api/analysis/{id}?userId={id} | 없음 |
| 채팅 질문 | POST | /api/documents/{id}/chat?userId={id} | JSON `{question}` |
| 채팅 조회 | GET | /api/documents/{id}/chat?userId={id} | 없음 |
| 내 문서 | GET | /api/documents?userId={id} | 없음 |

`documentType`은 `SUBSCRIPTION`, `RENTAL`, `INSURANCE`, `LOAN`, `OTHER` 중 하나여야 합니다.

## 5. 배포 (아직 로컬 검증 전제)

```bash
npm run build
```

Vercel 프로젝트 환경변수 `VITE_API_BASE_URL`을 배포된 Spring Boot의 **HTTPS** API 주소로 설정합니다. 예: `https://api.example.com` (마지막에 `/api`를 추가하지 않음).
`vercel.json`은 클라이언트 라우팅 시 새로고침 오류를 막습니다. Spring Boot에서는 Vercel 도메인을 CORS 허용해야 합니다.

### 필수 보안 작업 — 공개 배포 전

**현재 백엔드는 문서/분석/채팅 요청의 `userId` 파라미터를 클라이언트가 지정합니다. 이 프론트엔드는 보안 장벽이 아닙니다.**

백엔드가 매 요청의 JWT를 검증하고 **토큰에서 사용자 ID를 추출**하도록 바꿔야 하며, 다른 사용자의 문서를 조회/분석/대화하지 못하도록 테스트해야 합니다. 그 뒤 쿼리 파라미터 `userId`는 제거하는 편이 좋습니다.

현재 JWT는 프론트엔드 `localStorage`에 보관합니다. 학생 과제 로컬 MVP에는 간단하지만 XSS 위험이 있습니다. 공개 서비스 전에는 HttpOnly·Secure·SameSite 쿠키 등 인증 저장 방식을 재검토하세요. React 코드에서 AI API 키, OpenAI 키, MySQL 비밀번호는 절대 사용하지 마세요.

학교 API 키의 외부 서비스 활용 허용 여부 및 사용량 제한도 먼저 확인해야 합니다. 실제 개인정보가 담긴 문서는 시험용으로 업로드하지 마세요.
