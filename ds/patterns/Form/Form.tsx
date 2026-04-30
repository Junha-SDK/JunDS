"use client";
import { createContext, useContext } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

interface FormContextType {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setValue: (name: string, value: unknown) => void;
  setTouched: (name: string) => void;
}

const FormContext = createContext<FormContextType | null>(null);

export function useFormContext() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useFormContext must be used within Form");
  return ctx;
}

export interface FormProps {
  /** 폼 값 객체 */
  values: Record<string, unknown>;
  /** 필드 에러 메시지 */
  errors?: Record<string, string>;
  /** 필드 터치 상태 */
  touched?: Record<string, boolean>;
  /** 값 변경 콜백 */
  onChange: (name: string, value: unknown) => void;
  /** 필드 블러 콜백 */
  onBlur?: (name: string) => void;
  /** 제출 콜백 */
  onSubmit?: () => void;
  /** 자식 요소 */
  children: ReactNode;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 값/오류/터치 상태를 한곳에서 관리하는 폼 컨테이너.
 * @example
 * <Form values={values} onChange={setValues} errors={errors} onSubmit={handleSubmit}>
 *   <FormField name="email" label="이메일" />
 * </Form>
 * @status stable
 * @since 2.2.0
 * @tags form
 */
export function Form({
  values, errors = {}, touched = {}, onChange, onBlur, onSubmit, children, className,
}: FormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <FormContext.Provider value={{
      values,
      errors,
      touched,
      setValue: onChange,
      setTouched: (name) => onBlur?.(name),
    }}>
      <form onSubmit={handleSubmit} className={cn("space-y-4", className)} noValidate>
        {children}
      </form>
    </FormContext.Provider>
  );
}
