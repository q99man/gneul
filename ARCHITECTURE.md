# 그늘(Gneul) 프로젝트 아키텍처 분석 및 개선 제안

## 1. 현재 구조 요약

- **프론트엔드**: React 18 + Vite, React Router, Framer Motion  
  - `frontend/src/app`: pages, components, api, context, utils, hooks, data
- **백엔드**: Spring Boot, JPA, JWT + OAuth2  
  - `backend/.../com/search`: controller, service, repository, entity, dto, config

---

## 2. 프론트엔드 개선 제안

### 2.1 API 레이어: 인증 헤더 일원화

**현재**: `space.ts`, `reservation.ts`, `wishlist.ts`, `member.ts`에서 각각 `getToken()` 호출 후 `Authorization` 헤더를 수동 설정.

**제안**: `http.ts`에서 인증이 필요한 요청을 한 곳에서 처리.

- `request()` 옵션에 `auth: true` 추가 시, `getToken()`으로 헤더 자동 첨부.
- 401 응답 시 공통 처리(예: 로그인 페이지 리다이렉트 또는 콜백)를 옵션으로 지원.

이렇게 하면 각 API 모듈에서 `requireAuthHeaders()` 반복 호출을 제거하고, 인증 정책 변경 시 한 곳만 수정하면 됩니다.

### 2.2 공통 확인 팝업(Confirm Popup) 컴포넌트화

**현재**: HostSpaceForm, Wishlist, AppSidebar 등에서 비슷한 “확인/취소” 팝업을 각각 구현(흰색 박스, 확인/취소 버튼, `getBoundingClientRect` 등으로 위치 계산).

**제안**:

- `ConfirmPopover` 또는 `ConfirmPopup` 같은 공용 컴포넌트를 한 번 정의.
- Props: `open`, `onClose`, `onConfirm`, `title?`, `message?`, `anchorRef` 또는 `anchorRect`.
- 스타일은 기존과 동일(흰색 박스, 검정 확인 버튼, 테두리 취소 버튼) 유지.

이렇게 하면 UI/UX 일관성과 유지보수성이 좋아지고, 새 확인 플로우 추가 시 재사용이 쉬워집니다.

### 2.3 라우트 및 네이밍 정리

- **Order vs Reservation**: URL은 `/order`, 페이지명은 `Order`이지만 실제 플로우는 “예약 확정”입니다.  
  - 유지할 경우: “주문”이 비즈니스 용어라면 그대로 두고, 주석/문서에서 “예약 확정 단계”로 명시.  
  - 통일할 경우: `/reservation/checkout` 등으로 변경하고 `Order.tsx` → `ReservationCheckout.tsx` 같은 이름으로 정리하면 예약 도메인과 일치합니다.
- **호스트 공간**: `/host/new`와 `/space/new`가 동일한 `HostSpaceForm`을 가리키고 있음.  
  - 하나로 통일(예: `/space/new`, `/space/:id/edit`)하고, 사이드바 등에서는 `/space/new`만 사용하는 현재 방식 유지 권장.

### 2.4 에러 처리 및 401 공통 처리

**현재**: `HostSpaceList`, `Wishlist` 등에서 `ApiError`와 `status === 401`일 때 `navigate('/login', { replace: true })`를 각자 호출.

**제안**:

- `http.ts`의 `request()` 내부에서 401 시 콜백 호출(예: `onUnauthorized?.()`) 또는 전역 이벤트/Context로 “로그인 필요” 알림.
- 앱 최상단에서 한 번만 `onUnauthorized`를 등록해 로그인 페이지로 보내고, 개별 페이지에서는 401 분기 최소화.

이렇게 하면 인증 만료/실패 시 동작이 한 곳에서 관리됩니다.

### 2.5 타입/도메인 위치

- **현재**: `api/types.ts`에 DTO와 도메인 타입이 함께 있음.
- **선택**: 도메인 타입만 `types/` 또는 `domain/`으로 분리하고, `api/types.ts`는 API 요청/응답 DTO 위주로 두면 “API 스키마”와 “앱 도메인” 구분에 도움이 됩니다. 규모가 크지 않다면 현 구조 유지해도 무방합니다.

---

## 3. 백엔드 개선 제안

### 3.1 Controller 역할 분리 (Host vs Space)

**현재**:

- `SpaceController`: `/api/host/space` — 공간 등록/수정/삭제/상세.
- `HostController`: `/api/host/spaces` — 호스트 자신의 공간 목록.

**제안**:

- “호스트 전용 API”는 한 진입점으로 모으는 편이 이해하기 쉽습니다.  
  - 옵션 A: `HostController`에 공간 CRUD와 목록을 모두 두고 `SpaceController`는 “비호스트”용 공간 조회만 담당.  
  - 옵션 B: `SpaceController`에 호스트 관련 메서드를 모두 두고, `HostController`는 “내 공간 목록”만 유지.  
- 팀 컨벤션에 맞게 A/B 중 하나로 통일하면, “호스트 API는 어디에 있나?”에 대한 답이 명확해집니다.

### 3.2 API 응답 형식 통일

**현재**: 성공 시 `ResponseEntity<String>`(메시지) 또는 `ResponseEntity<SpaceFormDto>` 등 본문 직접 반환. 에러 시 메시지 문자열만 반환.

**제안**:

- 성공/실패를 모두 담는 공통 래퍼를 두면 프론트 처리와 에러 메시지 표시가 수월합니다.  
  - 예: `{ "success": true, "data": ... }` / `{ "success": false, "code": "SPACE_NOT_FOUND", "message": "..." }`.  
- 실패 시 HTTP status는 그대로 4xx/5xx를 쓰고, 본문에 `code`와 `message`를 넣어 프론트에서 `ApiError`와 매핑.

### 3.3 예약(Reservation) API 일관성

- **현재**: 예약 생성/목록/취소/확정/성공 페이지 등이 `ReservationController`에 있음.  
- **제안**:  
  - URL을 REST 스타일로 정리(예: `GET /api/reservation/hist` + query `page` 등).  
  - “주문서 폼”이 예약 플로우의 한 단계라면, 경로를 `/api/reservation/form`, `/api/reservation/confirm`처럼 reservation 하위로 두는 현재 방식 유지.  
  - 백엔드 서비스/엔티티 이름은 “Reservation”으로 통일하고, “Order”는 프론트/문서에서만 “주문서 UI” 의미로 사용할지 결정하면 됩니다.

### 3.4 DTO 및 검증

- `SpaceFormDto` 등에 `@JsonFormat`(openTime/closeTime) 등 이미 적용된 부분 유지.
- 날짜/시간 필드는 가능하면 ISO 8601 문자열로 통일하고, 프론트 `api/types.ts`와 필드명/형식을 맞추면 파싱 이슈를 줄일 수 있습니다.

---

## 4. 공통/풀스택 제안

### 4.1 Order vs Reservation 네이밍

- **백엔드**: 이미 “Reservation” 중심으로 되어 있음.  
- **프론트**:  
  - “Order”를 유지: 사용자에게 “주문서”로 보이게 하고, API/내부적으로는 reservation으로 매핑.  
  - “Reservation”으로 통일: URL/페이지명을 “예약 확정”, “예약 내역” 등으로 바꾸면 도메인과 일치.  
- 제안: 점진적으로 “Reservation”으로 통일하는 쪽을 추천(URL `/order` → `/reservation/checkout`, 페이지명 `Order` → `ReservationCheckout`). 이때 라우트와 사이드바/링크를 함께 수정.

### 4.2 타입 동기화

- 백엔드 DTO 필드명/타입을 바꿀 때 프론트 `api/types.ts`를 함께 수정하는 흐름을 문서화하거나, 필요 시 OpenAPI/스키마 생성 후 클라이언트 타입 생성 도구를 도입하면 실수를 줄일 수 있습니다.

### 4.3 테스트

- **프론트**: 중요한 플로우(예약 확정, 호스트 공간 등록/수정)에 대한 통합/흐름 테스트가 있으면 리팩터 시 안전망이 됩니다.  
- **백엔드**: `ReservationService`, `SpaceService` 등 핵심 서비스 단위 테스트가 있으면, 응답 형식 통일이나 DTO 변경 시 회귀를 잡기 좋습니다.

---

## 5. 우선 적용 권장 순서

1. **프론트**: `http.ts`에 인증 옵션 추가 및 401 공통 처리 → 각 API에서 인증 헤더/401 분기 제거.  
2. **프론트**: 확인 팝업 공용 컴포넌트 추출 → HostSpaceForm, Wishlist, AppSidebar 등에 적용.  
3. **백엔드**: (선택) 공통 API 응답 래퍼 도입 및 기존 컨트롤러에서 점진 적용.  
4. **풀스택**: Order/Reservation 네이밍 정책 확정 후, URL/파일명/문서를 한 방향으로 정리.  
5. **선택**: Controller 역할(Host vs Space) 정리 및 테스트 보강.

이 순서는 의존성이 적고, 단계별로 배포·검증하기 좋습니다.
