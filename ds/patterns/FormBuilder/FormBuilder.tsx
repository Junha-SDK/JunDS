"use client";
import { useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Button } from "../../primitives/Button";
import { Input } from "../../primitives/Input";
import { Textarea } from "../../primitives/Textarea";
import { Label } from "../../primitives/Label";
import { Select } from "../../composites/Select";
import type { SelectOption } from "../../composites/Select";

export type FieldType = "text" | "email" | "password" | "number" | "textarea" | "select";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validate?: (value: string) => string | undefined;
}

export interface FormBuilderProps {
  fields: FormField[];
  onSubmit: (values: Record<string, string>) => void | Promise<void>;
  submitLabel?: string;
  /** 추가 액션 (취소 버튼 등) */
  actions?: ReactNode;
  loading?: boolean;
  columns?: 1 | 2;
  className?: string;
}

/**
 * 선언적 폼 빌더 — 필드 배열로 폼 자동 생성
 * @example
 * <FormBuilder
 *   fields={[
 *     { name:"title", label:"제목", type:"text", required:true },
 *     { name:"desc", label:"설명", type:"textarea" },
 *     { name:"priority", label:"우선순위", type:"select", options:[...] },
 *   ]}
 *   onSubmit={handleSubmit}
 * />
 */
export function FormBuilder({
  fields,
  onSubmit,
  submitLabel = "저장",
  actions,
  loading,
  columns = 1,
  className,
}: FormBuilderProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach((f) => { init[f.name] = ""; });
    return init;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const setValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched.has(name)) validateField(name, value);
  };

  const validateField = (name: string, value: string): boolean => {
    const field = fields.find((f) => f.name === name);
    if (!field) return true;
    let error: string | undefined;
    if (field.required && !value.trim()) error = `${field.label}을(를) 입력해주세요`;
    if (!error && field.validate) error = field.validate(value);
    setErrors((prev) => {
      const next = { ...prev };
      if (error) next[name] = error; else delete next[name];
      return next;
    });
    return !error;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = new Set(fields.map((f) => f.name));
    setTouched(allTouched);
    let valid = true;
    fields.forEach((f) => { if (!validateField(f.name, values[f.name])) valid = false; });
    if (valid) onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-4", className)}>
      <div className={cn("grid gap-4", columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
        {fields.map((field) => {
          const hasError = !!errors[field.name] && touched.has(field.name);
          return (
            <div key={field.name} className={cn("flex flex-col gap-1.5", field.type === "textarea" && columns === 2 && "sm:col-span-2")}>
              <Label htmlFor={field.name} required={field.required}>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  value={values[field.name]}
                  onChange={(e) => setValue(field.name, e.target.value)}
                  onBlur={() => { setTouched((p) => new Set(p).add(field.name)); validateField(field.name, values[field.name]); }}
                  placeholder={field.placeholder}
                  error={hasError}
                />
              ) : field.type === "select" ? (
                <Select
                  options={field.options || []}
                  value={values[field.name]}
                  onChange={(v) => { setValue(field.name, v); setTouched((p) => new Set(p).add(field.name)); }}
                  placeholder={field.placeholder}
                  error={hasError}
                  fullWidth
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  value={values[field.name]}
                  onChange={(e) => setValue(field.name, e.target.value)}
                  onBlur={() => { setTouched((p) => new Set(p).add(field.name)); validateField(field.name, values[field.name]); }}
                  placeholder={field.placeholder}
                  error={hasError}
                />
              )}
              {hasError && <p className="text-xs text-danger">{errors[field.name]}</p>}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" loading={loading}>{submitLabel}</Button>
        {actions}
      </div>
    </form>
  );
}
