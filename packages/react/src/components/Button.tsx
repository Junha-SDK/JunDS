"use client";

/**
 * Button — <jd-button> 어댑터 (v2 ds/primitives/Button 표면 호환, 03-web-arch §11).
 *
 * 골격 소유권(DEC-008-(1)): 어댑터가 내부 골격 <button class="jd-button">을 React로
 * 직접 렌더하고, CE render()의 입양 규칙(§3.3)이 그 골격을 재사용한다. children·
 * className·ref·네이티브 이벤트는 전부 React(=v2와 동일한 내부 <button>) 소유로 남고,
 * CE update()가 만지는 것(disabled/aria-busy/type/스피너)은 어댑터가 같은 값으로
 * 렌더해 두 소유자가 항상 합의한다.
 *
 * 스피너 합의 규약: loading이면 어댑터가 .jd-button__spinner를 첫 자식으로 렌더
 * → CE update()는 존재 확인 후 삽입을 건너뛴다. 해제 시 React 커밋(노드 제거)이
 * CE microtask(update)보다 먼저라 CE는 이미 사라진 스피너를 만지지 않는다.
 *
 * type 기본값은 폼에서 의도치 않은 제출을 막는 "button"이다. 제출 버튼만
 * type="submit"을 명시한다. asChild는 data-jd-* 스타일 훅으로 CE 경로와 같은
 * variant/size/loading/fullWidth 시각을 유지한다.
 */
import { forwardRef, type MouseEvent } from "react";
import "@junds/web/button";
import "../jsx.js";
import { cx } from "../internal/cx.js";
import { Slot, Slottable } from "../internal/Slot.js";
import type { ButtonProps } from "./Button.types.js";

export type { ButtonProps, ButtonSize, ButtonVariant } from "./Button.types.js";

/** CE의 SPINNER_SVG와 동형 — 입양 골격의 SSR 완성 상태(§11-4)를 위해 어댑터가 선렌더 */
function Spinner() {
  return (
    <svg
      className="jd-button__spinner"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        opacity=".25"
      />
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        opacity=".75"
      />
    </svg>
  );
}

/**
 * 범용 버튼 컴포넌트 (v2 API 호환 어댑터)
 * @example
 * <Button variant="primary" size="md">저장</Button>
 * <Button variant="danger" loading>삭제 중...</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth,
      disabled,
      asChild = false,
      className,
      children,
      type,
      onClick,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    if (asChild) {
      const handleClick = (event: MouseEvent<HTMLElement>): void => {
        if (isDisabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event as never);
      };
      // v2 Slot 합성 그대로: 스피너/아이콘은 자식의 children 위치에 합쳐진다
      return (
        <Slot
          ref={ref as never}
          className={cx("jd-button", className)}
          {...props}
          data-jd-variant={variant}
          data-jd-size={size}
          data-jd-loading={loading ? "true" : undefined}
          data-jd-disabled={isDisabled ? "true" : undefined}
          data-jd-full-width={fullWidth ? "true" : undefined}
          aria-busy={loading || undefined}
          aria-disabled={isDisabled || undefined}
          tabIndex={isDisabled ? -1 : props.tabIndex}
          onClick={handleClick}
        >
          {loading ? (
            <Spinner />
          ) : leftIcon ? (
            <span style={{ flexShrink: 0 }}>{leftIcon}</span>
          ) : null}
          <Slottable>{children}</Slottable>
          {rightIcon && !loading ? (
            <span style={{ flexShrink: 0 }}>{rightIcon}</span>
          ) : null}
        </Slot>
      );
    }

    // 호스트 attribute: 반영형 프롭의 SSR 스타일 훅(§4.3). 디폴트는 미반영(DEC-012-2)과
    // 동형으로 비기본값만 쓴다. type은 안전한 기본값 button을 항상 명시한다.
    const effectiveType = type ?? "button";
    return (
      <jd-button
        variant={variant !== "primary" ? variant : undefined}
        size={size !== "md" ? size : undefined}
        type={effectiveType}
        loading={loading ? true : undefined}
        disabled={isDisabled ? true : undefined}
        full-width={fullWidth ? true : undefined}
      >
        <button
          ref={ref}
          type={effectiveType}
          disabled={isDisabled}
          aria-busy={loading || undefined}
          className={cx("jd-button", className)}
          onClick={onClick}
          {...props}
        >
          {loading ? (
            <Spinner />
          ) : leftIcon ? (
            <span style={{ flexShrink: 0 }}>{leftIcon}</span>
          ) : null}
          {children}
          {rightIcon && !loading ? (
            <span style={{ flexShrink: 0 }}>{rightIcon}</span>
          ) : null}
        </button>
      </jd-button>
    );
  },
);

Button.displayName = "Button";
