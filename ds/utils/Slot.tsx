"use client";

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import { cn } from "./cn";

/**
 * Slot — render-into-child primitive (Radix-style `asChild`).
 *
 * Supports two usage modes:
 *
 * 1. **Single-child mode.** When `<Slot>` wraps exactly one React element
 *    (no `<Slottable>`), it renders that element in place of itself, merging
 *    className/style/ref/event handlers from the slot onto the child.
 *
 * 2. **Slottable mode.** When the slot's children include a `<Slottable>`
 *    marker, the user-provided element inside `<Slottable>` becomes the
 *    rendered root, and the slot's surrounding siblings become that element's
 *    children — with the user's own children inserted at the Slottable's
 *    position. This is what lets components like `<Button asChild>` keep
 *    their internal layout (spinner, icons) while delegating the root to a
 *    `<Link>` or `<button>`.
 *
 * Rules:
 *   - Single-child mode: child MUST be a React element (no strings/fragments).
 *   - Slottable mode: `<Slottable>` MUST wrap exactly one React element.
 *   - className is merged via tailwind-merge so child wins on conflicts.
 *   - style is shallow-merged with child taking precedence.
 *   - Event handlers run slot-first, then child, in sequence.
 */

const SLOTTABLE_TYPE = Symbol.for("junds.Slottable");

interface SlottableComponent {
  (props: { children?: ReactNode }): ReactElement;
  $$junds$slottable$: typeof SLOTTABLE_TYPE;
  displayName: string;
}

/**
 * Marks the position inside a Slot's children where the user-provided element
 * should be rendered. Surrounding siblings become children of that element.
 *
 * @example
 *   <Slot ref={ref} className={cls}>
 *     <Spinner />
 *     <Slottable>{children}</Slottable>
 *     <RightIcon />
 *   </Slot>
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
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[junds/Slot] <Slottable> must wrap exactly one React element.",
        );
      }
      return null;
    }
    const userChild = userElement as ReactElement<AnyChildProps>;
    const newChildren = arr.map((node, i) =>
      i === slottableIdx ? userChild.props.children : node,
    );
    return mergeIntoChild(userChild, slotProps, forwardedRef, newChildren);
  }

  if (arr.length !== 1 || !isValidElement(arr[0])) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[junds/Slot] expected a single React element child or a <Slottable>. Got:",
        children,
      );
    }
    return null;
  }
  const child = arr[0] as ReactElement<AnyChildProps>;
  return mergeIntoChild(child, slotProps, forwardedRef, child.props.children);
});

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
    className: cn(slotProps.className, childProps.className),
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
  return key.length > 2 && key.startsWith("on") && key[2] === key[2].toUpperCase();
}

function composeRefs<T>(
  ...refs: Array<Ref<T> | undefined>
): Ref<T> | undefined {
  const filtered = refs.filter(Boolean) as Array<Ref<T>>;
  if (filtered.length === 0) return undefined;
  if (filtered.length === 1) return filtered[0];
  return (node: T) => {
    for (const ref of filtered) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref != null) {
        (ref as { current: T | null }).current = node;
      }
    }
  };
}
