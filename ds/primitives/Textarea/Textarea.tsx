"use client";
import { forwardRef, useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import type { TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * 에러 상태를 시각적으로 표시하고 `aria-invalid="true"`를 설정합니다.
   *
   * `FormField error`와 함께 사용하면 별도 연결 코드 없이 같은 상태가 적용됩니다.
   */
  error?: boolean;
  /**
   * 내용 높이에 맞춰 입력 영역을 자동으로 늘립니다.
   *
   * 활성화하면 사용자의 수동 세로 리사이즈는 비활성화됩니다.
   */
  autoResize?: boolean;
  /**
   * `maxLength` 기준 현재 글자 수를 표시합니다.
   *
   * controlled와 uncontrolled 사용 방식을 모두 지원하며, 카운터는
   * `aria-describedby`에 자동 연결됩니다.
   */
  showCount?: boolean;
}

/**
 * 텍스트영역 컴포넌트
 * @example
 * <Textarea autoResize placeholder="설명을 입력하세요" maxLength={500} showCount />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      error,
      autoResize,
      showCount,
      maxLength,
      className,
      onChange,
      value,
      defaultValue,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const countId = `${useId()}-count`;
    const [uncontrolledLength, setUncontrolledLength] = useState(
      () => String(defaultValue ?? value ?? "").length,
    );

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoResize) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [autoResize]);

    useEffect(() => {
      resize();
    }, [value, resize]);

    const setRefs = useCallback(
      (el: HTMLTextAreaElement | null) => {
        innerRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.RefObject<HTMLTextAreaElement | null>).current = el;
      },
      [ref],
    );

    const length = value === undefined ? uncontrolledLength : String(value).length;
    const showCounter = showCount && maxLength !== undefined;
    const resolvedAriaInvalid = error ? true : ariaInvalid;
    const isInvalid =
      resolvedAriaInvalid === true ||
      resolvedAriaInvalid === "true" ||
      resolvedAriaInvalid === "grammar" ||
      resolvedAriaInvalid === "spelling";
    const describedBy =
      [ariaDescribedBy, showCounter ? countId : undefined].filter(Boolean).join(" ") || undefined;

    return (
      <div className="relative">
        <textarea
          ref={setRefs}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          aria-describedby={describedBy}
          aria-invalid={resolvedAriaInvalid}
          onChange={(e) => {
            if (value === undefined) {
              setUncontrolledLength(e.currentTarget.value.length);
            }
            onChange?.(e);
            resize();
          }}
          className={cn(
            // autoResize 가 height 를 매 입력마다 바꾸는 요소다 — transition-all 이면
            // 글자 칠 때마다 높이가 늦게 따라와 커서가 밀린다. 색·그림자만 전이시킨다.
            // bg-white 는 다크에서 흰 판이 남으므로 bg-card 로 옮긴다
            "w-full border bg-card/80 backdrop-blur-sm px-3.5 py-2.5 text-sm rounded-xl transition-[border-color,box-shadow,background-color] duration-200 ease-out",
            "placeholder:text-muted-light/60 resize-y min-h-[80px]",
            "focus:outline-none focus:border-primary focus:bg-card focus:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-card-hover",
            autoResize && "resize-none overflow-hidden",
            showCounter && "pb-8",
            isInvalid
              ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,63,63,0.12),0_1px_2px_rgba(0,0,0,0.04)]"
              : "border-border hover:border-muted-light",
            className,
          )}
          {...props}
        />
        {showCounter && (
          <span
            id={countId}
            className="pointer-events-none absolute bottom-2 right-3 text-xs tabular-nums text-muted-light"
          >
            {length}/{maxLength}
          </span>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
