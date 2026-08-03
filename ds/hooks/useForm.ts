"use client";
import { useState, useCallback, useRef } from "react";

export type ValidationRule<T = any> = {
  required?: string; // error message if empty
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: T) => string | undefined; // custom validator
};

export type FormRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export interface UseFormReturn<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  setValue: (name: keyof T, value: any) => void;
  setTouched: (name: keyof T) => void;
  /** 외부(서버 등) 검증 실패를 필드 에러로 통보 */
  setError: (name: keyof T, message: string) => void;
  handleChange: (
    name: keyof T,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (name: keyof T) => () => void;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e?: React.FormEvent) => void;
  reset: () => void;
  validate: () => boolean;
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  rules?: FormRules<T>,
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialRef = useRef(initialValues);

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialRef.current);

  const validateField = useCallback(
    (name: keyof T, value: any): string | undefined => {
      const rule = rules?.[name];
      if (!rule) return undefined;

      const strValue = String(value ?? "");

      if (rule.required && !value && value !== 0 && value !== false) {
        return rule.required;
      }
      if (rule.minLength && strValue.length < rule.minLength.value) {
        return rule.minLength.message;
      }
      if (rule.maxLength && strValue.length > rule.maxLength.value) {
        return rule.maxLength.message;
      }
      if (rule.pattern && !rule.pattern.value.test(strValue)) {
        return rule.pattern.message;
      }
      if (rule.validate) {
        return rule.validate(value);
      }
      return undefined;
    },
    [rules],
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let valid = true;
    for (const key of Object.keys(values) as (keyof T)[]) {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        valid = false;
      }
    }
    setErrors(newErrors);
    return valid;
  }, [values, validateField]);

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // clear error on change
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const setError = useCallback((name: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [name]: message }));
  }, []);

  const setTouched = useCallback(
    (name: keyof T) => {
      setTouchedState((prev) => ({ ...prev, [name]: true }));
      // validate on blur
      setValues((prev) => {
        const error = validateField(name, prev[name]);
        setErrors((e) =>
          error
            ? { ...e, [name]: error }
            : (() => {
                const n = { ...e };
                delete n[name];
                return n;
              })(),
        );
        return prev;
      });
    },
    [validateField],
  );

  const handleChange = useCallback(
    (name: keyof T) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value =
          e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
        setValue(name, value);
      },
    [setValue],
  );

  const handleBlur = useCallback(
    (name: keyof T) => () => {
      setTouched(name);
    },
    [setTouched],
  );

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => async (e?: React.FormEvent) => {
      e?.preventDefault();
      // touch all fields
      const allTouched: Partial<Record<keyof T, boolean>> = {};
      for (const key of Object.keys(values) as (keyof T)[]) {
        allTouched[key] = true;
      }
      setTouchedState(allTouched);

      if (!validateAll()) return;
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateAll],
  );

  const reset = useCallback(() => {
    setValues(initialRef.current);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    isSubmitting,
    setValue,
    setTouched,
    setError,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validate: validateAll,
  };
}
