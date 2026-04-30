"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "../../utils/cn";
import { Slot } from "../../utils/Slot";
import { createCompound } from "../../utils/createCompound";

interface DisclosureContextValue {
  isOpen: boolean;
  toggle: () => void;
  triggerId: string;
  contentId: string;
}

const DisclosureContext = createContext<DisclosureContextValue | null>(null);

function useDisclosureContext(part: string): DisclosureContextValue {
  const ctx = useContext(DisclosureContext);
  if (!ctx) {
    throw new Error(
      `<Disclosure.${part}> must be rendered inside a <Disclosure> root.`,
    );
  }
  return ctx;
}

export interface DisclosureProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 초기 열림 상태 (uncontrolled).
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * 외부에서 제어할 때의 열림 상태 (controlled). `onOpenChange`와 함께 사용.
   */
  open?: boolean;

  /**
   * 열림 상태가 바뀌면 호출됩니다 (uncontrolled / controlled 양쪽).
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Radix-style Slot 위임. `true`이면 Disclosure 루트가 자체 `<div>` 대신
   * 단일 자식 엘리먼트로 위임합니다. layout primitive(예: `<section>`)에
   * Disclosure 동작을 얹을 때 사용하세요.
   *
   * @default false
   */
  asChild?: boolean;

  children: ReactNode;
}

const DisclosureRoot = forwardRef<HTMLDivElement, DisclosureProps>(
  (
    { defaultOpen = false, open, onOpenChange, asChild, className, children, ...props },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;

    const triggerId = useId();
    const contentId = useId();

    const toggle = useCallback(() => {
      const next = !isOpen;
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    }, [isOpen, isControlled, onOpenChange]);

    const Comp = asChild ? Slot : "div";

    return (
      <DisclosureContext.Provider value={{ isOpen, toggle, triggerId, contentId }}>
        <Comp
          ref={ref as never}
          data-state={isOpen ? "open" : "closed"}
          className={cn(className)}
          {...props}
        >
          {children}
        </Comp>
      </DisclosureContext.Provider>
    );
  },
);
DisclosureRoot.displayName = "Disclosure";

export interface DisclosureTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Slot 위임. true이면 자체 `<button>` 대신 단일 자식으로 위임 */
  asChild?: boolean;
}

const DisclosureTrigger = forwardRef<HTMLButtonElement, DisclosureTriggerProps>(
  ({ asChild, className, onClick, children, ...props }, ref) => {
    const { isOpen, toggle, triggerId, contentId } = useDisclosureContext("Trigger");
    const Comp = asChild ? Slot : "button";

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      onClick?.(e);
      if (!e.defaultPrevented) toggle();
    };

    return (
      <Comp
        ref={ref as never}
        type={asChild ? undefined : "button"}
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={contentId}
        data-state={isOpen ? "open" : "closed"}
        onClick={handleClick}
        className={cn(className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
DisclosureTrigger.displayName = "Disclosure.Trigger";

export interface DisclosureContentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 닫혔을 때도 DOM에 유지할지 여부. `true`이면 hidden으로 감춤,
   * `false`이면 렌더하지 않음.
   * @default false
   */
  forceMount?: boolean;
}

const DisclosureContent = forwardRef<HTMLDivElement, DisclosureContentProps>(
  ({ forceMount, className, children, ...props }, ref) => {
    const { isOpen, triggerId, contentId } = useDisclosureContext("Content");
    if (!isOpen && !forceMount) return null;
    return (
      <div
        ref={ref}
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        data-state={isOpen ? "open" : "closed"}
        hidden={!isOpen}
        className={cn(className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
DisclosureContent.displayName = "Disclosure.Content";

/**
 * 단일 토글 가능한 패널을 위한 compound 컴포넌트.
 *
 * `Disclosure.Trigger`와 `Disclosure.Content`를 자식으로 받아 열림/닫힘
 * 상태를 공유합니다. uncontrolled(`defaultOpen`) / controlled(`open` +
 * `onOpenChange`) 양쪽 모두 지원합니다.
 *
 * @example
 *   <Disclosure defaultOpen={false}>
 *     <Disclosure.Trigger className="font-semibold">자세히 보기</Disclosure.Trigger>
 *     <Disclosure.Content>여기에 숨겨진 내용이 들어갑니다.</Disclosure.Content>
 *   </Disclosure>
 *
 * @status stable
 * @since 2.3.0
 * @tags disclosure, layout
 */
export const Disclosure = createCompound(DisclosureRoot, {
  Trigger: DisclosureTrigger,
  Content: DisclosureContent,
});
