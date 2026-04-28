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
  values: Record<string, unknown>;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  onChange: (name: string, value: unknown) => void;
  onBlur?: (name: string) => void;
  onSubmit?: () => void;
  children: ReactNode;
  className?: string;
}

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
