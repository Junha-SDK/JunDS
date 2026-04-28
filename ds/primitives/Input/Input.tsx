"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { InputHTMLAttributes } from "react";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /**
   * 입력 필드의 높이 및 텍스트 크기.
   *
   * - `sm` — 높이 32px, 텍스트 12px. 테이블 셀, 툴바 등 밀집 UI
   * - `md` — 높이 40px, 텍스트 14px. 기본값. 일반 폼
   * - `lg` — 높이 48px, 텍스트 16px. 모바일 터치, 강조 입력
   *
   * @default "md"
   *
   * @example
   * <Input size="lg" placeholder="검색어를 입력하세요" />
   */
  size?: InputSize;

  /**
   * 유효성 검증 실패 시 에러 상태를 표시합니다.
   *
   * `true`로 설정하면 테두리가 빨간색(`border-danger`)으로 변하고,
   * 포커스 링도 빨간색 글로우로 바뀝니다.
   * 입력 필드 아래에 에러 메시지 텍스트를 함께 배치하는 것을 권장합니다.
   *
   * @default false
   *
   * @example
   * <Input error placeholder="필수 입력" />
   * <span className="text-danger text-xs">이름을 입력해주세요</span>
   */
  error?: boolean;

  /**
   * 입력 필드 왼쪽에 배치할 아이콘이나 요소.
   *
   * 검색 아이콘, 통화 기호(₩, $) 등을 표시할 때 사용합니다.
   * `pointer-events-none`이 적용되어 클릭이 입력 필드로 전달됩니다.
   *
   * @example
   * <Input leftSlot={<SearchIcon />} placeholder="검색..." />
   *
   * @example
   * <Input leftSlot={<span>₩</span>} placeholder="금액" />
   */
  leftSlot?: React.ReactNode;

  /**
   * 입력 필드 오른쪽에 배치할 아이콘이나 요소.
   *
   * 초기화(clear) 버튼, 단위 텍스트(kg, cm), 상태 아이콘 등에 사용합니다.
   * `leftSlot`과 달리 클릭 이벤트가 차단되지 않으므로
   * 버튼 등 인터랙티브 요소도 배치할 수 있습니다.
   *
   * @example
   * <Input rightSlot={<span className="text-muted">원</span>} />
   *
   * @example
   * <Input
   *   rightSlot={<button onClick={handleClear}>✕</button>}
   *   placeholder="검색어"
   * />
   */
  rightSlot?: React.ReactNode;

  /**
   * 입력 필드에 힌트 텍스트를 표시합니다.
   *
   * 사용자가 값을 입력하기 전 어떤 정보를 입력해야 하는지 안내합니다.
   * 연한 색상(`text-muted-light/60`)으로 표시되며, 입력 시 사라집니다.
   *
   * @example
   * <Input placeholder="example@email.com" />
   */
  placeholder?: string;

  /**
   * 입력 필드를 비활성화합니다.
   *
   * `true`이면 투명도가 낮아지고(`opacity-40`), 커서가 `not-allowed`로 바뀌며,
   * 배경이 회색(`bg-gray-50`)으로 변합니다. 포커스와 입력이 차단됩니다.
   *
   * @default false
   *
   * @example
   * <Input disabled value="수정 불가" />
   */
  disabled?: boolean;

  /**
   * 입력 필드에 추가할 CSS 클래스.
   *
   * 디자인 시스템이 제공하지 않는 커스텀 스타일이 필요할 때
   * 탈출구(escape hatch)로 사용합니다.
   *
   * @example
   * <Input className="text-right" placeholder="금액" />
   */
  className?: string;
}

const sizeStyles: Record<InputSize, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-3.5 text-sm rounded-xl",
  lg: "h-12 px-4 text-base rounded-xl",
};

/**
 * 텍스트 입력 컴포넌트.
 *
 * 크기, 에러 상태, 좌우 슬롯을 지원합니다.
 * `size`로 주변 UI 밀도에 맞추고, `error`로 유효성 검증 결과를 표시합니다.
 *
 * @example
 * // 기본
 * <Input placeholder="이름 입력" />
 *
 * @example
 * // 아이콘 포함
 * <Input leftSlot={<SearchIcon />} placeholder="검색..." />
 *
 * @example
 * // 에러 상태
 * <Input error placeholder="필수 입력" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = "md", error, leftSlot, rightSlot, className, ...props }, ref) => {
    if (leftSlot || rightSlot) {
      return (
        <div
          className={cn(
            "relative flex items-center",
            error && "text-danger",
          )}
        >
          {leftSlot && (
            <span className="absolute left-3 text-muted pointer-events-none">{leftSlot}</span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full border bg-white/80 backdrop-blur-sm transition-all duration-200 ease-out",
              "placeholder:text-muted-light/60",
              "focus:outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-50",
              error
                ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,63,63,0.12),0_1px_2px_rgba(0,0,0,0.04)]"
                : "border-border",
              sizeStyles[size],
              leftSlot && "pl-9",
              rightSlot && "pr-9",
              className,
            )}
            {...props}
          />
          {rightSlot && (
            <span className="absolute right-3 text-muted">{rightSlot}</span>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={cn(
          "w-full border bg-white/80 backdrop-blur-sm transition-all duration-200 ease-out",
          "placeholder:text-muted-light/60",
          "focus:outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-50",
          error
            ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,63,63,0.12),0_1px_2px_rgba(0,0,0,0.04)]"
            : "border-border",
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
