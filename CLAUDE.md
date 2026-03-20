@AGENTS.md

# 프로젝트 개요

Flow 메신저 채팅방에 **예약 메시지를 등록·전송·취소**할 수 있는 웹 서비스.
사용자가 날짜/시간을 지정하면 해당 시각에 Flow 채팅방으로 메시지가 자동 발송된다.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router) + React 19 + TypeScript
- **DB**: Neon (Serverless PostgreSQL) + Drizzle ORM
- **메시지 예약**: Upstash QStash (delay 기반 예약 발행)
- **외부 API**: Flow REST API (`api.flow.team`) — 채팅 메시지 전송
- **배포**: Vercel
- **스타일링**: Tailwind CSS v4

## 핵심 흐름

1. 사용자가 `/new`에서 예약 메시지 등록
2. `POST /api/messages` → DB 저장 (pending) + QStash에 delay 메시지 발행
3. 예약 시각 도달 시 QStash가 `POST /api/send-message` 호출
4. 서명 검증 → Flow API로 채팅 전송 → DB 상태 업데이트 (sent/failed)

## 주요 디렉토리

- `src/app/` — 페이지 및 API 라우트
- `src/components/` — 클라이언트 컴포넌트 (MessageList, MessageCard, MessageForm)
- `src/db/` — Drizzle DB 인스턴스 및 스키마
- `src/lib/` — Flow API 래퍼, QStash 클라이언트, 타입 정의
- `drizzle/` — SQL 마이그레이션 파일
