"use client";

/**
 * Slot/Slottable — v2 ds/utils/Slot.tsx의 사본 (asChild 합성은 어댑터 층에서
 * v2 코드 그대로 수행한다 — 03-web-arch §11-3). 원본과의 차이 2곳뿐:
 * className 병합이 cn(tailwind-merge) → cx(단순 결합), composeRefs는 공용 분리.
 */

import {
  Children,
  cloneElement,
  isValidElement,
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import { cx } from "./cx.js";
import { composeRefs } from "./composeRefs.js";

const SLOTTABLE_TYPE = Symbol.for("junds.Slottable");

interface SlottableComponent {
  (props: { children?: ReactNode }): ReactElement;
  $$junds$slottable$: typeof SLOTTABLE_TYPE;
  displayName: string;
}

/**
 * Slot children 중 사용자 제공 엘리먼트가 렌더될 위치 표식.
 * 주변 형제들은 그 엘리먼트의 children이 된다.
 */
export const Slottable = (({ children }) => <>{children}</>) as SlottableComponent;
Slottable.$$junds$slottable$ = SLOTTABLE_TYPE;
Slottable.displayName = "Slottable";

function isSlottable(node: unknown): node is ReactElement<{ children?: ReactNode }> {
  return (
    isValidElement(node) &&
    typeof node.type === "function" &&
    (node.type as Partial<SlottableComponent>).$$junds$slottable$ === SLOTTABLE_TYPE
  );
}

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

type AnyChildProps = HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>;
  children?: ReactNode;
  [key: string]: unknown;
};

export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot(
  { children, ...slotProps },
  forwardedRef,
) {
  const arr = Children.toArray(children);
  const slottableIdx = arr.findIndex(isSlottable);

  if (slottableIdx !== -1) {
    const slottable = arr[slottableIdx] as ReactElement<{ children?: ReactNode }>;
    const userElement = slottable.props.children;
    if (!isValidElement(userElement)) {
      warnDev("[junds/Slot] <Slottable> must wrap exactly one React element.");
      return null;
    }
    const userChild = userElement as ReactElement<AnyChildProps>;
    const newChildren = arr.map((node, i) =>
      i === slottableIdx ? userChild.props.children : node,
    );
    return mergeIntoChild(userChild, slotProps, forwardedRef, newChildren);
  }

  if (arr.length !== 1 || !isValidElement(arr[0])) {
    warnDev("[junds/Slot] expected a single React element child or a <Slottable>.");
    return null;
  }
  const child = arr[0] as ReactElement<AnyChildProps>;
  return mergeIntoChild(child, slotProps, forwardedRef, child.props.children);
});

function warnDev(message: string): void {
  try {
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "production") return;
  } catch {
    /* process 부재 환경 — 개발로 간주 */
  }
  console.warn(message);
}

function mergeIntoChild(
  child: ReactElement<AnyChildProps>,
  slotProps: HTMLAttributes<HTMLElement>,
  forwardedRef: Ref<HTMLElement> | undefined,
  newChildren: ReactNode,
): ReactElement {
  const childProps = child.props ?? {};
  const merged: AnyChildProps = {
    ...slotProps,
    ...childProps,
    ref: composeRefs(forwardedRef, childProps.ref),
    className: cx(slotProps.className, childProps.className),
    style: mergeStyles(slotProps.style, childProps.style),
    ...mergeEventHandlers(
      slotProps as unknown as Record<string, unknown>,
      childProps as unknown as Record<string, unknown>,
    ),
    children: newChildren,
  };
  return cloneElement(child, merged);
}

function mergeStyles(
  a: CSSProperties | undefined,
  b: CSSProperties | undefined,
): CSSProperties | undefined {
  if (!a && !b) return undefined;
  return { ...(a ?? {}), ...(b ?? {}) };
}

function mergeEventHandlers(
  slot: Record<string, unknown>,
  child: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(slot)) {
    if (!isEventKey(key)) continue;
    const slotHandler = slot[key];
    const childHandler = child[key];
    if (typeof slotHandler !== "function") continue;
    if (typeof childHandler !== "function") {
      out[key] = slotHandler;
      continue;
    }
    out[key] = (...args: unknown[]) => {
      (slotHandler as (...a: unknown[]) => unknown)(...args);
      (childHandler as (...a: unknown[]) => unknown)(...args);
    };
  }
  return out;
}

function isEventKey(key: string): boolean {
  return key.length > 2 && key.startsWith("on") && key[2] === key[2]!.toUpperCase();
}
