/**
 * createForm — 폼 검증 Behavior (v2 useForm).
 *
 * v2는 값·터치·에러를 전부 React state로 들고 onChange/onBlur 핸들러를 필드마다
 * 나눠줬다. 바닐라에서는 **폼 요소 자체가 이미 값을 갖고 있다** — FormData가 정본이고
 * 이 Behavior는 규칙 판정과 에러 표시만 얹는다(§1.6-1 네이티브 위임의 폼판).
 *
 * 에러는 `jd-text-field`류의 `error` 프로퍼티에 실어 컴포넌트가 그리게 하고,
 * 그런 표면이 없는 네이티브 필드는 aria-invalid만 세운다.
 */
import type { Behavior } from "./types.js";

export interface FieldRule {
  required?: string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  /** 커스텀 — 메시지를 반환하면 실패 */
  validate?: (value: string) => string | undefined;
}

export type FormRules = Record<string, FieldRule>;

export interface FormOptions {
  /** 필드 blur 시 즉시 검증. 기본 true */
  validateOnBlur?: boolean;
  /** 제출 가로채기. 유효할 때만 호출된다 */
  onSubmit?: (values: Record<string, string>) => void | Promise<void>;
}

export interface Form extends Behavior<FormRules> {
  /** 전체 검증 — 유효하면 true, 에러는 필드에 반영된다 */
  validate(): boolean;
  values(): Record<string, string>;
  errors(): Record<string, string>;
  /** 초기 상태로 되돌린다(네이티브 reset + 에러 제거) */
  reset(): void;
}

/** name을 가진 폼 컨트롤만 대상 */
function fields(form: HTMLFormElement): HTMLElement[] {
  return Array.from(form.querySelectorAll<HTMLElement>("[name]")).filter(
    (el) => "value" in el && (el as HTMLInputElement).name,
  );
}

function messageFor(rule: FieldRule | undefined, value: string): string {
  if (!rule) return "";
  if (rule.required && value.trim() === "") return rule.required;
  if (rule.minLength && value.length < rule.minLength.value) return rule.minLength.message;
  if (rule.maxLength && value.length > rule.maxLength.value) return rule.maxLength.message;
  if (rule.pattern && !rule.pattern.value.test(value)) return rule.pattern.message;
  return rule.validate?.(value) ?? "";
}

/** 에러를 어디에 실을지 — jd-* 컴포넌트면 error 프로퍼티, 아니면 aria-invalid */
function showError(control: HTMLElement, message: string): void {
  const host = control.closest<HTMLElement>("[error], jd-text-field, jd-textarea, jd-number-input, jd-password-input, jd-currency-input, jd-phone-input");
  if (host && "error" in host) {
    (host as unknown as { error: string }).error = message;
    return;
  }
  if (message) control.setAttribute("aria-invalid", "true");
  else control.removeAttribute("aria-invalid");
}

export function createForm(
  form: HTMLFormElement,
  rules: FormRules = {},
  opts: FormOptions = {},
): Form {
  let table = rules;
  let errorMap: Record<string, string> = {};

  const readValues = (): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const el of fields(form)) {
      const c = el as HTMLInputElement;
      out[c.name] = c.value ?? "";
    }
    return out;
  };

  const validateField = (control: HTMLInputElement): boolean => {
    const message = messageFor(table[control.name], control.value ?? "");
    if (message) errorMap[control.name] = message;
    else delete errorMap[control.name];
    showError(control, message);
    return !message;
  };

  const validateAll = (): boolean => {
    errorMap = {};
    let ok = true;
    for (const el of fields(form)) {
      if (!validateField(el as HTMLInputElement)) ok = false;
    }
    return ok;
  };

  const onBlur = (e: Event): void => {
    if (opts.validateOnBlur === false) return;
    const t = e.target as HTMLInputElement;
    if (t?.name && form.contains(t)) validateField(t);
  };

  const onSubmit = (e: Event): void => {
    if (!validateAll()) {
      e.preventDefault(); // 브라우저 제출을 막고 에러만 남긴다
      // 첫 실패 필드로 포커스 — 긴 폼에서 어디가 틀렸는지 찾게 만들지 않는다
      const first = fields(form).find((el) => errorMap[(el as HTMLInputElement).name]);
      (first as HTMLElement | undefined)?.focus?.();
      return;
    }
    if (opts.onSubmit) {
      e.preventDefault();
      void opts.onSubmit(readValues());
    }
  };

  form.addEventListener("blur", onBlur, true); // blur는 버블하지 않는다 — 캡처로 받는다
  form.addEventListener("submit", onSubmit);
  let destroyed = false;

  return {
    validate: validateAll,
    values: readValues,
    errors: () => ({ ...errorMap }),
    reset() {
      form.reset();
      for (const el of fields(form)) showError(el, "");
      errorMap = {};
    },
    update(next) {
      table = { ...table, ...(next as FormRules) };
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      form.removeEventListener("blur", onBlur, true);
      form.removeEventListener("submit", onSubmit);
    },
  };
}
