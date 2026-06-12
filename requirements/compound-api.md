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

## Scope

**대상**

- `ds/composites/**` 의 모든 복합 컴포넌트 (137종)
- 영역(헤더/본문/푸터/액션 등) 분리가 의미 있는 `ds/patterns/**` 패턴
- 신규 작성되는 모든 composite — `npm run scaffold composite <Name>` 템플릿이
  `createCompound` + `Slot` 골격을 자동 주입한다.

**대상 외**

- `ds/primitives/**` — 단일 영역만 가지므로 멤버 분리가 무의미. `asChild`만
  필요하면 root에 단독 적용한다 (`Button`이 reference).
- `ds/layout/**` — `Stack`/`Grid`는 children 자체가 사용자 정의이므로
  멤버 패턴이 적용되지 않는다.
- 외부에서 import 되는 third-party wrapper.

## User stories / acceptance criteria

- **As a 사용자** I can `<Card asChild><Link href="/x"><Card.Body>…` 처럼
  root만 `<Link>`로 위임해도 패딩/그림자/hover 스타일이 유지된다.
  → AC: `asChild` 적용 시 `cn()` 클래스 + `forwardRef`/`onClick` 전부 자식에
  병합되며 추가 wrapper element가 발생하지 않는다.
- **As a 사용자** I can `<Modal>`에서 `Modal.Header`만 빼거나 `Modal.Footer`를
  맨 위로 이동해도 동작한다.
  → AC: 멤버는 위치 의존이 없고, 부재해도 root 렌더링이 깨지지 않는다.
- **As a 라이브러리 작성자** I can grep으로 `Object.assign(Root, { ` 사용처를
  0건으로 유지한다.
  → AC: lint/CI에서 `Object.assign(<PascalCase>, {` 패턴이 검출되면 실패.
- **As a 사용자** I can sub-member에 `asChild`를 시도하면 dev 콘솔에 명확한
  에러가 뜬다 — 두 단계 cloneElement를 디버그하지 않아도 된다.
  → AC: `Card.Header asChild` → dev에서 `console.error("[JunDS] sub-member에는 asChild를 사용할 수 없습니다…")`.

## Design / behavior notes

- **Slot 단일 자식 룰.** `Slot`은 `React.Children.only`로 강제하지 않고
  dev에서 warn 후 `null` 반환한다. throw하지 않는 이유: 테스트/스토리북에서
  순간적으로 children이 비는 상황이 흔하고, throw하면 트리 전체가 깨진다.
- **이벤트 머지 순서.** Slot → user 자식 순서로 같은 이름의 핸들러를
  실행한다. user의 `e.preventDefault()`가 라이브러리 동작을 막을 수 있게 하기
  위함. 라이브러리 측 핸들러가 항상 먼저 실행되어 user가 그 결과 위에서
  결정할 수 있어야 한다.
- **className 병합.** `cn(slotClass, props.className)` — 즉 user className이
  뒤에 와서 충돌 시 우선한다. tailwind-merge가 conflicting utility를 정리한다.
- **ref 합성.** root에 `forwardRef` + `useComposedRefs`를 사용. asChild가
  아니어도 user ref와 internal ref 병행이 필요한 경우(focus trap 등) 같은
  훅을 재사용한다.
- **dev-only 검사.** `createCompound`는 dev 환경에서 멤버 키 중복 시 warn한다
  (`Object.assign`은 silent overwrite여서 막지 못함).

## Touched files

- `ds/utils/Slot.tsx` — Slot 컴포넌트 본체 (단일 자식 검사 + cloneElement + ref 병합).
- `ds/utils/createCompound.ts` — 멤버 부착 + dev 중복 검사 + 타입 추론.
- `ds/utils/polymorphic.ts` — `as`/`asChild` 보조 타입.
- `ds/composites/Card/Card.tsx` — reference 구현 (요건 변경 시 항상 함께 업데이트).
- `ds/composites/Modal/Modal.tsx` — 두 번째 reference (asChild + 멤버 4개 + portal).
- `scripts/scaffold.mjs` — composite 템플릿이 항상 이 규약을 만족하게 유지.
- `requirements/design-system-library.md` — 전체 라이브러리 정책의 cross-link.

## Open questions

- **`asChild` + portal 조합.** `Modal` 같은 portal 컴포넌트의 root에 asChild를
  허용해야 하는가? 현재는 미허용 — portal 타깃이 user wrapper로 바뀌면 z-index
  / focus trap의 가정이 깨진다. 차후 `Tooltip`처럼 trigger에 asChild를 따로
  두는 패턴으로 대체 검토 필요.
- **server component compatibility.** Slot이 cloneElement를 쓰므로 RSC에서
  `'use client'` 경계를 통과해야 한다. composite 단위로 `'use client'`를
  이미 박았지만, asChild로 RSC 자식을 넘기는 케이스의 동작은 아직 검증 전.
- **codemod.** 137개 일괄 변환 비용 vs 수동 PR 관리 비용. 현재 결정은 "수동",
  근거는 root 시그니처 다양성. 자동 변환 가능한 부분집합(`Object.assign(Root,
  flatObj)` only)을 도려낸 부분 codemod는 검토 가치 있음.
- **`asChild` prop 이름.** Radix와 일치하지만 일부 사용자에게 의미가
  불명확하다는 피드백. `as` prop과의 차이(런타임 vs polymorphism)를 문서에
  명시해야 한다.

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
