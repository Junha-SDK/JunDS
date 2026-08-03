"use client";
import { cn } from "../../utils/cn";
import { Avatar } from "../../primitives/Avatar";
import type { AvatarSize } from "../../primitives/Avatar";

export interface AvatarStackProps {
  /** 표시할 이름 목록 */
  names: string[];
  /** 최대 표시 수 */
  max?: number;
  /** 아바타 크기 */
  size?: AvatarSize;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 아바타 스택 (겹쳐진 그룹)
 * @example
 * <AvatarStack names={["김준하","이서연","박민수","최유진","정다은"]} max={3} />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function AvatarStack({ names, max = 4, size = "sm", className }: AvatarStackProps) {
  const visible = names.slice(0, max);
  const overflow = names.length - max;

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {visible.map((name, i) => (
        // 겹친 아바타를 갈라 놓는 링은 "뒤에 깔린 면"의 색이어야 한다. ring-white 는
        // 다크에서 흰 테두리로 남으므로 모드를 따라가는 card 로 바꾼다.
        <div key={`${name}-${i}`} className="ring-2 ring-card rounded-full">
          <Avatar name={name} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "rounded-full bg-muted/15 text-muted flex items-center justify-center font-semibold tabular-nums ring-2 ring-card",
            size === "xs"
              ? "w-6 h-6 text-[9px]"
              : size === "sm"
              ? "w-8 h-8 text-[10px]"
              : size === "md"
              ? "w-9 h-9 text-xs"
              : size === "lg"
              ? "w-11 h-11 text-sm"
              : "w-14 h-14 text-base",
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
