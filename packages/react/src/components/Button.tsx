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
 * v2와의 표면 차이는 보고서(DECISIONS DEC-022) 판정표 참조 — 특히:
 * - type 기본값: v2/네이티브 "submit" 유지(jd-button 단독 기본 "button"과 다름 —
 *   어댑터가 호스트에 명시 전파해 CE가 내부 button을 "button"으로 되돌리지 못하게 한다)
 * - asChild: CE 입양 쿼리가 button 태그 고정(§3.3)이라 임의 엘리먼트 위임 불가 —
 *   호스트 없는 Slot 폴백(기본 시각만, variant/size 셀렉터 무효) + 개발 경고.
 */
import { forwardRef } from "react";
import "@junds/web/button";
import "../jsx.js";
import { cx } from "../internal/cx.js";
import { warnOnce } from "../internal/dev.js";
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
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".25" />
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
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    if (asChild) {
      warnOnce(
        "button-aschild",
        "Button asChild: <jd-button>의 입양 골격이 button 태그 고정이라 CE 경유가 불가합니다. " +
          "기본 시각(.jd-button)만 적용된 Slot 폴백으로 렌더합니다 — variant/size는 무시됩니다 " +
          "(DECISIONS DEC-022 판정표 참조).",
      );
      // v2 Slot 합성 그대로: 스피너/아이콘은 자식의 children 위치에 합쳐진다
      return (
        <Slot ref={ref as never} className={cx("jd-button", className)} {...props}>
          {loading ? <Spinner /> : leftIcon ? <span style={{ flexShrink: 0 }}>{leftIcon}</span> : null}
          <Slottable>{children}</Slottable>
          {rightIcon && !loading ? <span style={{ flexShrink: 0 }}>{rightIcon}</span> : null}
        </Slot>
      );
    }

    // 호스트 attribute: 반영형 프롭의 SSR 스타일 훅(§4.3). 디폴트는 미반영(DEC-012-2)과
    // 동형으로 비기본값만 쓴다. type은 CE 기본("button")이 네이티브 기본("submit")과
    // 달라 항상 명시한다.
    const effectiveType = type ?? "submit";
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
          {...props}
        >
          {loading ? <Spinner /> : leftIcon ? <span style={{ flexShrink: 0 }}>{leftIcon}</span> : null}
          {children}
          {rightIcon && !loading ? <span style={{ flexShrink: 0 }}>{rightIcon}</span> : null}
        </button>
      </jd-button>
    );
  },
);

Button.displayName = "Button";
