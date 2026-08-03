"use client";
import { useState, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface CollapsibleProps {
  /** 열림 상태 (controlled) */
  open?: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** 트리거 요소 */
  trigger: ReactNode;
  /** 펼쳐졌을 때 보여줄 내용 */
  children: ReactNode;
  /** 초기 열림 상태 (uncontrolled) */
  defaultOpen?: boolean;
  /** 추가 클래스 */
  className?: string;
  /** 트리거가 텍스트가 아닌 경우 사용할 접근성 라벨 */
  "aria-label"?: string;
}

/**
 * 접기/펼치기 컴포넌트 (단일 항목)
 * @example
 * <Collapsible trigger={<span>더보기</span>}>
 *   <p>숨겨진 내용</p>
 * </Collapsible>
 * @status stable
 * @since 2.2.0
 * @tags disclosure
 */
export function Collapsible({
  open: controlledOpen,
  onOpenChange,
  trigger,
  children,
  defaultOpen = false,
  className,
  ...rest
}: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const toggle = useCallback(() => {
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }, [isOpen, isControlled, onOpenChange]);

  return (
    <div className={cn("w-full", className)}>
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "w-full cursor-pointer rounded-xl text-left transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
        aria-expanded={isOpen}
        aria-label={rest["aria-label"] ?? (typeof trigger === "string" ? trigger : "토글")}
      >
        {trigger}
      </button>
      <div
        className={cn(
          // 실제로 변하는 것은 행 높이와 투명도뿐이다. all 이면 자식의 padding·font-size 까지
          // 매 프레임 리플로우 대상이 된다. 높이가 움직이므로 감속 요청을 받는다.
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
