"use client";
import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useId,
  type AriaAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { Label } from "../../primitives/Label";

interface FormControlProps {
  id?: string;
  "aria-describedby"?: string;
  "aria-errormessage"?: string;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
  "aria-required"?: AriaAttributes["aria-required"];
}

function mergeIds(...values: Array<string | undefined>): string | undefined {
  const ids = values.flatMap((value) => value?.split(/\s+/) ?? []).filter(Boolean);
  return ids.length > 0 ? [...new Set(ids)].join(" ") : undefined;
}

export interface FormFieldProps {
  /** 필드 라벨 */
  label?: string;
  /** 필수 여부 */
  required?: boolean;
  /** 에러 메시지 */
  error?: string;
  /** 힌트 텍스트 */
  hint?: string;
  /**
   * 라벨이 가리킬 입력 요소의 id.
   *
   * 생략하면 단일 자식 입력의 기존 id를 사용하거나 안전한 id를 자동 생성합니다.
   */
  htmlFor?: string;
  /**
   * 입력 요소.
   *
   * 단일 React 엘리먼트이면 id와 ARIA 연결 속성을 자동으로 합성합니다.
   * 여러 요소를 조합할 때는 `htmlFor`와 ARIA 속성을 직접 지정하세요.
   */
  children: ReactNode;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 폼 필드 래퍼 (Label + Input + Error + Hint)
 * @example
 * <FormField label="이름" required error={errors.name} hint="실명을 입력하세요.">
 *   <Input />
 * </FormField>
 * @status stable
 * @since 2.2.0
 * @tags form
 */
export function FormField({
  label,
  required,
  error,
  hint,
  htmlFor,
  children,
  className,
}: FormFieldProps) {
  const generatedId = useId();
  const child =
    Children.count(children) === 1 &&
    isValidElement<FormControlProps>(children) &&
    children.type !== Fragment
      ? (children as ReactElement<FormControlProps>)
      : null;
  const controlId = child?.props.id ?? htmlFor ?? `junds-field-${generatedId}`;
  const errorId = `${controlId}-error`;
  const hintId = `${controlId}-hint`;
  const hasError = Boolean(error);

  const control = child
    ? cloneElement(child, {
        id: controlId,
        "aria-describedby": mergeIds(
          child.props["aria-describedby"],
          hasError ? errorId : hint ? hintId : undefined,
        ),
        "aria-errormessage": hasError
          ? mergeIds(child.props["aria-errormessage"], errorId)
          : child.props["aria-errormessage"],
        "aria-invalid": hasError || child.props["aria-invalid"] || undefined,
        "aria-required": required || child.props["aria-required"] || undefined,
      })
    : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)} data-invalid={hasError || undefined}>
      {label && (
        <Label htmlFor={child ? controlId : htmlFor} required={required}>
          {label}
        </Label>
      )}
      {control}
      {hasError && (
        <p id={errorId} className="flex items-center gap-1 text-xs text-danger" role="alert">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
            <path
              d="M6 3.5v3M6 8h.01"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          {error}
        </p>
      )}
      {hint && !hasError && (
        <p id={hintId} className="text-xs text-muted-light">
          {hint}
        </p>
      )}
    </div>
  );
}
