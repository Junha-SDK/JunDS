"use client";

/**
 * TextField — <jd-text-field> 어댑터 + v2 호환 표면 Input / FormField.
 *
 * DEC-012-5의 통합(v2 Input + FormField → jd-text-field 단일 표면)을 어댑터에서
 * v2 의미론으로 역번역한다:
 * - TextField: v3 네이티브 표면(label·error 메시지 문자열·size). CE와 1:1.
 * - Input: v2 표면(size·error boolean·leftSlot/rightSlot) → TextField 위임.
 *   leftSlot/rightSlot은 G1 범위 외(DEC-012-5) — 개발 경고 후 무시.
 *   메시지 없는 error(boolean true)는 v3 표면에 시각 훅이 없다
 *   (css가 [error]:not([error=""]) — 메시지가 곧 상태) — 경고 후 미반영.
 * - FormField: 직계 자식 Input/TextField를 찾아 label/required/error(문자열)/htmlFor를
 *   그 자식의 jd-text-field로 접어 넣는다(fold) — 라벨·에러 행·aria 연결이 전부
 *   CE 한 곳에서 나오게 하는 역번역. hint는 CE 표면에 없어 FormField가 아래에 렌더.
 *
 * 입양 계약 주의(DEC-008-(1) 실측 마찰 — DECISIONS DEC-022):
 * 1) CE render()의 입양 경로는 label·input·error 3형제를 전부 요구(비-널 단언) —
 *    어댑터는 라벨/에러가 비어도 항상 3형제를 렌더한다(hidden으로 접음, CE와 동일 규칙).
 * 2) CE update()가 입양한 label(textContent=)과 error 행(innerHTML=)의 children을
 *    통째로 재구축한다 — React가 그 텍스트 노드를 소유하면 이후 리컨실에서 분리 노드를
 *    만진다. 회피: 두 노드는 dangerouslySetInnerHTML로 렌더해 React가 내부 children을
 *    영원히 diff하지 않게 한다(문자열 교체는 안전, SSR 완성 골격도 유지).
 * 3) CE #onInput이 host.value를 자가 동기화해 React controlled "거부"(재렌더 없는 복원)를
 *    이후 update()가 되덮는다 — onChange 디스패치 안에서 host.value를 prop 값으로
 *    동기 재고정 + 커밋마다 layout effect로 host.value를 정렬해 방어한다.
 */
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import "@junds/web/text-field";
import type { JdTextField } from "@junds/web/text-field/element";
import "../jsx.js";
import { composeRefs } from "../internal/composeRefs.js";
import { cx } from "../internal/cx.js";
import { escapeHtml, warnOnce } from "../internal/dev.js";
import { useIsoLayoutEffect } from "../internal/useIsoLayoutEffect.js";

/** CE의 ERROR_ICON_SVG와 동형 — SSR/입양 수렴용 */
const ERROR_ICON_SVG =
  `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">` +
  `<circle cx="6" cy="6" r="5.5" stroke="currentColor"/>` +
  `<path d="M6 3.5v3M6 8h.01" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`;

export type InputSize = "sm" | "md" | "lg";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** 라벨 행 — 비어 있으면 행 자체가 접힌다(hidden) */
  label?: string;
  /** 입력 필드 크기 — v2 Input과 동일 램프 (sm 32px / md 40px / lg 48px) */
  size?: InputSize;
  /** 에러 메시지 — 비어있지 않으면 곧 에러 상태 (aria-invalid + 메시지 행, DEC-012-5) */
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      size = "md",
      error,
      className,
      id: idProp,
      value,
      defaultValue,
      onChange,
      type = "text",
      placeholder = "",
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const errorId = `${id}-error`;
    const hostRef = useRef<JdTextField>(null);
    const innerRef = useRef<HTMLInputElement>(null);
    const controlled = value !== undefined;
    const hasError = Boolean(error);

    // controlled 거부 방어(모듈 주석 3): React의 restoreControlledState(디스패치 종료 후
    // 동기 복원)보다 먼저 host 상태를 prop 값으로 되돌려, 이미 큐된 CE update()가
    // input을 타이핑 값으로 되덮지 못하게 한다(비교가 같아져 no-op).
    const valueRef = useRef(value);
    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
      onChange?.(e);
      const host = hostRef.current;
      if (controlled && host) host.value = String(valueRef.current ?? "");
    };

    // 커밋마다 host.value 정렬 — CE 최초 update()가 defaultValue를 기본값 ""와의
    // diff로 지우는 것(마운트), controlled 반영(수용), 거부 후 재렌더까지 한 곳이 담당.
    // valueRef 갱신도 커밋 시점에 — 디스패치(handleChange)는 항상 커밋 이후라 최신값 보장.
    // layout 시점인 이유는 useIsoLayoutEffect 주석 참조(CE microtask보다 앞서야 한다).
    useIsoLayoutEffect(() => {
      valueRef.current = value;
      const host = hostRef.current;
      if (!host) return;
      host.value = controlled ? String(value ?? "") : (innerRef.current?.value ?? "");
    });

    // SSR 초기값: CE 최초 update()가 host.value 기본 ""와의 diff로 서버 직렬화 값을
    // hydration 전에 지우는 플래시를 host value attribute(업그레이드 초기값, §1.3)로 차단
    const ssrValue = controlled ? String(value ?? "") : defaultValue != null ? String(defaultValue) : "";
    return (
      <jd-text-field
        ref={hostRef}
        label={label || undefined}
        placeholder={placeholder || undefined}
        name={props.name}
        type={type !== "text" ? type : undefined}
        size={size !== "md" ? size : undefined}
        value={ssrValue || undefined}
        disabled={props.disabled ? true : undefined}
        required={props.required ? true : undefined}
        error={error || undefined}
      >
        {/* CE가 textContent로 재구축하는 노드 — dSIH로 React의 내부 diff 차단(모듈 주석 2).
            jsx-a11y는 dSIH 텍스트를 못 보지만 htmlFor 연결·텍스트 모두 실재한다 */}
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label
          className="jd-text-field__label"
          htmlFor={id}
          hidden={!label}
          dangerouslySetInnerHTML={{ __html: label ? escapeHtml(label) : "" }}
        />
        {/* type/placeholder는 CE update()가 항상 정규화(기본값 명시)하므로 어댑터도 항상
            명시해 서버 HTML = CE 정규화 결과 = 클라이언트 프롭을 일치시킨다 — React 19
            속성 hydration 검사(실측: type="text"/placeholder="" 불일치 경고) 대응 */}
        <input
          {...props}
          type={type}
          placeholder={placeholder}
          ref={composeRefs(ref, innerRef)}
          id={id}
          className={cx("jd-text-field__input", className)}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          {...(hasError ? { "aria-invalid": "true" as const, "aria-describedby": errorId } : null)}
        />
        <p
          className="jd-text-field__error"
          id={errorId}
          hidden={!hasError}
          dangerouslySetInnerHTML={{
            __html: hasError ? ERROR_ICON_SVG + escapeHtml(error!) : "",
          }}
        />
      </jd-text-field>
    );
  },
);

TextField.displayName = "TextField";

/* ---------------------------------------------------------------- Input (v2) */

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** 입력 필드의 높이 및 텍스트 크기 (v2와 동일: sm/md/lg, 기본 md) */
  size?: InputSize;
  /** 유효성 검증 실패 시 에러 상태 표시 (v2: boolean) */
  error?: boolean;
  /** v2 leftSlot — G1 범위 외(DEC-012-5), 무시됨 */
  leftSlot?: ReactNode;
  /** v2 rightSlot — G1 범위 외(DEC-012-5), 무시됨 */
  rightSlot?: ReactNode;
}

/**
 * 텍스트 입력 컴포넌트 (v2 API 호환 어댑터) — 내부는 TextField(<jd-text-field>).
 * @example
 * <Input error placeholder="필수 입력" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, leftSlot, rightSlot, ...props }, ref) => {
    if (leftSlot || rightSlot) {
      warnOnce(
        "input-slots",
        "Input leftSlot/rightSlot은 G1 파일럿 범위 외입니다(DEC-012-5, 후속 배치 재심의) — 무시됩니다.",
      );
    }
    // FormField fold 경로는 error를 문자열 메시지로 덮어 내려보낸다(아래 FormField 참조).
    let message: string | undefined;
    if (typeof error === "string") {
      message = error;
    } else if (error === true) {
      warnOnce(
        "input-error-boolean",
        "Input error={true}: v3 jd-text-field는 메시지 없는 에러 시각이 없습니다" +
          "(css 훅이 [error]:not([error=\"\"]) — 메시지가 곧 상태, DEC-012-5). " +
          "FormField error 메시지와 함께 쓰면 완전 호환됩니다.",
      );
    }
    return <TextField ref={ref} error={message} {...props} />;
  },
);

Input.displayName = "Input";

/* ------------------------------------------------------------ FormField (v2) */

export interface FormFieldProps {
  /** 필드 라벨 */
  label?: string;
  /** 필수 여부 */
  required?: boolean;
  /** 에러 메시지 */
  error?: string;
  /** 힌트 텍스트 */
  hint?: string;
  /** htmlFor */
  htmlFor?: string;
  /** 입력 요소 */
  children: ReactNode;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 폼 필드 래퍼 (v2 API 호환 어댑터) — 직계 자식 Input/TextField에 라벨·에러를 접어
 * 넣어(jd-text-field 단일 표면) 렌더한다. v2와 달리 aria-invalid/aria-describedby가
 * 자동 연결된다(상위 호환). required 폴드는 라벨 별표와 함께 input의 네이티브
 * required도 켠다 — v2(별표만)와 다른 유일한 의미 변화(판정표 참조).
 * @example
 * <FormField label="이름" required error={errors.name}>
 *   <Input id="name" error={!!errors.name} />
 * </FormField>
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
  const arr = Children.toArray(children);
  const foldIdx = arr.findIndex(
    (c) => isValidElement(c) && (c.type === Input || c.type === TextField),
  );
  const folded = foldIdx !== -1;
  const mapped = !folded
    ? arr
    : arr.map((child, i) => {
        if (i !== foldIdx || !isValidElement(child)) return child;
        const childProps = child.props as Record<string, unknown>;
        const patch: Record<string, unknown> = {};
        if (label !== undefined && childProps["label"] === undefined) patch["label"] = label;
        if (required !== undefined && childProps["required"] === undefined) patch["required"] = required;
        if (error) patch["error"] = error; // 문자열 메시지가 자식의 boolean error보다 우선
        if (htmlFor !== undefined && childProps["id"] === undefined) patch["id"] = htmlFor;
        return cloneElement(child, patch as never);
      });

  if (!folded && (label || error) && typeof window !== "undefined") {
    warnOnce(
      "formfield-no-fold",
      "FormField: 직계 자식에서 Input/TextField를 찾지 못해 라벨/에러를 jd-text-field로 " +
        "접지 못했습니다. 전역 클래스 폴백으로 렌더합니다(별표 등 호스트 스코프 스타일 제외).",
    );
  }

  return (
    <div className={cx("jd-form-field", className)}>
      {/* 폴드 실패 시 폴백 — 전역 클래스 규칙(.jd-text-field__label 등)은 호스트 밖에서도 적용된다 */}
      {!folded && label ? (
        <label className="jd-text-field__label" htmlFor={htmlFor}>
          {label}
        </label>
      ) : null}
      {mapped}
      {!folded && error ? (
        <p
          className="jd-text-field__error"
          dangerouslySetInnerHTML={{ __html: ERROR_ICON_SVG + escapeHtml(error) }}
        />
      ) : null}
      {hint && !error ? <p className="jd-form-field__hint">{hint}</p> : null}
    </div>
  );
}
