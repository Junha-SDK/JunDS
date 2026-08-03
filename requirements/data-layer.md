# Data Layer

- **Slug:** `data-layer`
- **Status:** active
- **Owner:** goodjunha@gmail.com
- **Last updated:** 2026-05-04

## Goal

외부 데이터 라이브러리(SWR/React Query) 의존 없이 가벼운 fetch + mutation +
옵티미스틱 업데이트 표준 훅을 제공한다. JunDS 컴포넌트와 즉시 결합 가능
(`SocialFeed`+`useInfiniteFeed`, `EmailInbox`+`useResource` 등).

## Scope

**In scope**

- `useResource(key, fetcher, options)` — SWR-style 캐시 + revalidate +
  windowFocus revalidation + invalidation
- `useMutation(fn, { onSuccess, invalidates })` — POST/PUT/DELETE 표준화
- `useOptimisticState(initial)` — 옵티미스틱 업데이트 + 자동 rollback
- `useInfiniteFeed({ fetchPage })` — 이미 존재하는 cursor 페이지네이션
- 단일 모듈 캐시 (Map) — 컴포넌트 트리 외부에서도 invalidate 가능

**Out of scope**

- GraphQL 클라이언트 — 별도 라이브러리
- offline-first sync (replication) — 후속 작업
- WebSocket 실시간 — 호출자 측

## User stories / acceptance criteria

- [x] **As a 개발자** I can `useResource(["user", id], () => fetchUser(id))`
      한 줄로 캐싱+로딩+에러를 얻는다.
- [x] **As a 개발자** I can `useMutation(api.like, { invalidates: [["posts"]] })`
      로 mutation 후 관련 목록을 자동 재검증할 수 있다.
- [x] **As a 사용자** I can 좋아요를 누르면 옵티미스틱 카운트가 즉시 +1,
      서버 실패 시 자동으로 -1 롤백되는 것을 본다 (`useOptimisticState`).
- [x] **As a 개발자** I can window focus 시 자동 재검증을 끄거나 켤 수 있다
      (`revalidateOnFocus: false`).

## Design / behavior notes

- **캐시 키**: `JSON.stringify(key)` — array/object/primitive 모두 안전.
  같은 직렬화 결과면 같은 캐시.
- **TTL = 0 vs Infinity**: 0이면 매 요청 fetch (캐시 안 씀), Infinity면 수동
  invalidate 전까지 무한 캐시.
- **inflight 가드**: 동일 key의 fetch 진행 중에 새 useResource 마운트 시
  중복 fetch하지 않고 같은 promise를 공유.
- **subscribers Map**: 같은 key에 마운트된 모든 컴포넌트는 캐시 변경 시 자동
  re-render.
- **에러도 캐시**: 한 번 실패 → 같은 TTL 동안 같은 에러를 노출 (스파이크 방지).

## Touched files (for agents)

- `ds/hooks/useResource.ts`
- `ds/hooks/useMutation.ts`
- `ds/hooks/useOptimistic.ts`
- `ds/hooks/useInfiniteFeed.ts`

## Open questions

- **Suspense 통합**: `use(promise)` 또는 `useSyncExternalStore` 기반 Suspense
  지원을 추가할지. 현재는 단순 boolean loading 노출.
- **devtools**: 캐시 상태 시각화 패널이 필요한가 — `<DataDevtools />`.

## Changelog

- 2026-05-04 — created.
