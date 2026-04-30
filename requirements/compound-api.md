# Compound API — JunDS 컴포넌트 조립 규약

**Slug:** `compound-api`
**Status:** active
**Owner:** goodjunha@gmail.com
**Last updated:** 2026-04-29

## Goal

JunDS의 모든 복합 컴포넌트가 **레고 블록처럼 조립** 가능하도록 일관된 두 가지
규약을 따른다:

1. **Compound members** — 한 컴포넌트의 시각적 영역(헤더/본문/푸터 등)은
   `Component.Header`, `Component.Body` 형태의 멤버로 노출한다. 사용자가
   영역을 자유롭게 생략·재정렬할 수 있다.
2. **`asChild` prop (Slot 위임)** — root 엘리먼트를 사용자가 임의의 컴포넌트
   (`<Link>`, `<button>`, 외부 wrapper)로 교체해도 design-system 스타일은
   그대로 적용된다.

이 규약을 지키면 외부 사용자가 137개 composite를 동일한 멘탈 모델로 조립할 수
있고, 새 사용 사례마다 새 prop을 추가할 필요가 없어진다.

## 원칙

- **Object.assign 직접 호출 금지.** 항상 `createCompound(Root, { ... })`를
  사용한다. 타입 시그니처가 일관되고, 추후 dev-only 검사(중복 멤버 키 등)를
  추가할 여지가 생긴다.
- **`asChild`는 root만.** sub-member(`Card.Header` 등)는 `asChild`를 가지지
  않는다. 위임 대상이 모호해지고, 두 단계 cloneElement는 디버그가 어렵다.
- **Slot은 단일 React element 자식만 허용.** 복수 children, fragment,
  string은 dev에서 console.warn 후 `null` 반환. 컴포넌트 시그니처는
  TypeScript에서 강제하지 않으므로(=runtime 검증) 사용자에게 명시적으로
  알린다.
- **className 충돌은 `cn()`(tailwind-merge)로 해결.** Slot이 자동으로
  처리하지만, 새 sub-member 작성 시에도 `cn(slotClass, props.className)`를
  사용해 사용자 className이 항상 우선되도록 한다.
- **이벤트 핸들러는 시퀀스 실행.** Slot은 같은 이름의 핸들러(slot.onClick,
  child.onClick)를 슬롯 → 자식 순서로 호출한다. 새 컴포넌트에서도 같은 규칙을
  유지한다.

## 표준 템플릿

새 compound composite를 작성할 때 따를 골격:

```tsx
"use client";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Slot } from "../../utils/Slot";
import { createCompound } from "../../utils/createCompound";

export interface FooProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children?: ReactNode;
  /* component-specific props here */
}

const FooRoot = forwardRef<HTMLDivElement, FooProps>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref as never}
        className={cn("/* base classes */", className)}
        {...props}
      />
    );
  },
);
FooRoot.displayName = "Foo";

function FooHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("/* header classes */", className)} {...props} />;
}

function FooBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("/* body classes */", className)} {...props} />;
}

export const Foo = createCompound(FooRoot, {
  Header: FooHeader,
  Body: FooBody,
});
```

## 예시 — Card

`ds/composites/Card/Card.tsx`가 reference 구현이다:

- `Card`(루트), `Card.Header`, `Card.Body`, `Card.Footer` 멤버
- `asChild`로 root를 `<Link>`로 위임 가능
- `createCompound`로 멤버 부착

```tsx
// 기본 조립
<Card hoverable>
  <Card.Header>제목</Card.Header>
  <Card.Body>본문</Card.Body>
  <Card.Footer>
    <Button>저장</Button>
  </Card.Footer>
</Card>

// 외부 컨테이너로 위임
<Card asChild hoverable>
  <Link href="/profile">
    <Card.Body>프로필로 이동</Card.Body>
  </Link>
</Card>
```

## 점진 마이그레이션

기존 137개 composite 중 `Object.assign(...)`을 사용하는 곳은 다음 단계로
교체한다 (한 PR에 한 컴포넌트 단위):

1. import 추가: `Slot`, `createCompound`
2. root에 `asChild?: boolean` prop 추가, `Slot`으로 분기
3. `Object.assign(Root, { ... })` → `createCompound(Root, { ... })`
4. 기존 props/멤버 시그니처는 절대 깨지 않는다 (backward-compat 필수)
5. 쇼케이스 페이지에 `asChild` 데모 한 섹션 추가

자동 codemod는 도입하지 않는다. composite마다 root 시그니처가 다르고,
잘못된 일괄 변환은 수십 페이지를 한 번에 깰 수 있다.

## 관련

- `ds/utils/Slot.tsx` — Slot 구현
- `ds/utils/createCompound.ts` — 멤버 부착 헬퍼
- `ds/composites/Card/Card.tsx` — reference 구현
- `requirements/design-system-library.md` — 전체 라이브러리 정책

## Changelog

- 2026-04-29 — created.
