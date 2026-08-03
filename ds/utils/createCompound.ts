"use client";
import { createElement, forwardRef } from "react";
import type { ForwardedRef } from "react";

/**
 * createCompound — attach sub-component members to a root component.
 *
 * Standardises the JunDS compound pattern. Replaces inline `Object.assign(...)`
 * boilerplate so every compound component exposes its members in a consistent,
 * type-safe way.
 *
 * Dev-only checks (requirements/compound-api.md):
 *   1. 멤버 키가 root에 이미 존재하면 `console.warn` — `Object.assign`은
 *      silent overwrite여서 잡지 못하던 실수를 드러낸다.
 *   2. sub-member에 `asChild`를 넘기면 `console.error` — asChild는 root
 *      전용이다. 두 단계 cloneElement는 위임 대상이 모호해지고 디버그가
 *      어렵기 때문에 dev에서 즉시 알린다.
 *
 * @example
 *   const Card = createCompound(CardRoot, {
 *     Header: CardHeader,
 *     Body: CardBody,
 *     Footer: CardFooter,
 *   });
 *
 *   <Card>
 *     <Card.Header>Title</Card.Header>
 *     <Card.Body>Body</Card.Body>
 *   </Card>
 *
 * The returned value is the root component augmented with the members object,
 * so existing call sites that use the root directly (`<Card>`) keep working.
 */

const IS_DEV = process.env.NODE_ENV !== "production";

/** React 컴포넌트로 렌더 가능한 값인지 — 함수 컴포넌트 or forwardRef/memo exotic. */
function isComponentLike(value: unknown): boolean {
  return (
    typeof value === "function" ||
    (typeof value === "object" && value !== null && "$$typeof" in (value as object))
  );
}

/**
 * dev 전용: sub-member를 감싸 `asChild` 사용을 감지한다.
 * prod에서는 호출되지 않으므로 컴포넌트 identity는 prod와 동일하게 유지된다.
 */
function withAsChildGuard(key: string, member: unknown): unknown {
  if (!isComponentLike(member)) return member;

  const Guarded = forwardRef(function GuardedSubMember(
    props: Record<string, unknown>,
    ref: ForwardedRef<unknown>,
  ) {
    const { asChild, ...rest } = props;
    if (asChild !== undefined) {
      console.error(
        `[JunDS] sub-member에는 asChild를 사용할 수 없습니다 — asChild는 compound root에서만 지원됩니다. <*.${key}>에서 asChild를 제거하세요.`,
      );
    }
    if (ref != null) {
      (rest as Record<string, unknown>).ref = ref;
    }
    return createElement(member as never, rest as never);
  });
  Guarded.displayName =
    (member as { displayName?: string }).displayName ??
    (member as { name?: string }).name ??
    key;
  return Guarded;
}

export function createCompound<Root extends object, Members extends Record<string, unknown>>(
  root: Root,
  members: Members,
): Root & Members {
  if (IS_DEV) {
    const guarded: Record<string, unknown> = {};
    for (const key of Object.keys(members)) {
      if (key in root) {
        console.warn(
          `[JunDS] createCompound: 멤버 키 "${key}"가 root에 이미 존재합니다 — 기존 값을 덮어씁니다. 멤버 이름을 바꾸거나 중복 부착을 제거하세요.`,
        );
      }
      guarded[key] = withAsChildGuard(key, members[key]);
    }
    return Object.assign(root, guarded as Members);
  }
  return Object.assign(root, members);
}
