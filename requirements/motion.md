# Motion

- **Slug:** `motion`
- **Status:** shipped
- **Owner:** goodjunha@gmail.com
- **Last updated:** 2026-08-03

## Goal

CSS 기반 가벼운 모션 추상. framer-motion 같은 큰 dep 없이 "진입 애니메이션
한 줄 적용"이 가능하고, `prefers-reduced-motion` 사용자에는 자동 비활성화된다.
시각 회귀 위험을 줄이기 위해 미세 애니메이션은 8가지 프리셋으로만 제한.

## Scope

**In scope**

- `<Motion preset="fade-up" delay={100}>` 컴포넌트 (primitive)
- 8가지 프리셋: fade, fade-up, fade-down, scale, slide-up, slide-down,
  slide-left, slide-right
- `useReducedMotion` — `prefers-reduced-motion` 감지 (이미 존재)
- `useAnimationFrame` — RAF 루프 + 자동 cleanup + reduced-motion 게이트
- `app/globals.css`에 8개 keyframe (`@keyframes mFade`, `mFadeUp`, …)
- 모든 프리셋은 `respectReducedMotion=true` (기본) 시 reduced-motion에서
  즉시 적용 (transition 0ms)

**Out of scope**

- 복잡한 spring/orchestration — framer-motion 사용 권장
- 스크롤 트리거 애니메이션 — `IntersectionObserver` + 호출자 측에서 결합

## User stories / acceptance criteria

- [x] **As a 개발자** I can `<Motion preset="fade-up">`로 카드 진입 애니메이션
      한 줄을 적용할 수 있다.
- [x] **As a reduced-motion 사용자** I can 모든 `Motion` 컴포넌트가 자동으로
      애니메이션을 건너뛰고 즉시 표시되는 것을 경험한다.
- [x] **As a 개발자** I can `delay={100}` prop으로 staggered 진입을 구현한다.
- [x] **As a 개발자** I can `useAnimationFrame((dt) => …)` 한 줄로 매 프레임
      로직을 등록하고 언마운트 시 자동 cleanup된다.

## Design / behavior notes

- **CSS animation vs JS**: 복합 애니메이션 외에는 CSS keyframe이 더 부드럽고
  메인 스레드를 막지 않음. JS는 RAF 훅으로만 사용.
- **`once` 시맨틱 (예약)**: 현재 구현은 마운트 시 한 번 실행. IntersectionObserver
  통합은 `<Motion observe>` prop으로 후속 작업.
- **reduced-motion 게이트**: `useReducedMotion()`이 `true`면 className 자체를
  넣지 않음 (CSS animation 자체가 추가되지 않음). globals.css에 전역 reduce
  rule도 있어 이중 보호.

## Touched files (for agents)

- `ds/primitives/Motion/Motion.tsx`
- `ds/hooks/useReducedMotion.ts`
- `ds/hooks/useAnimationFrame.ts`
- `app/globals.css` (mFade*, mSlide* keyframes)

## Open questions

- **scroll-trigger**: 화면에 들어올 때만 트리거하는 prop 추가 (`onView`,
  `threshold`). 별도 훅 `useInView` 가능.
- **stagger 헬퍼**: 자식 N개를 자동으로 delay × index로 묶는 `MotionList`
  컴포넌트가 필요한가.

## Changelog

- 2026-05-04 — created.
