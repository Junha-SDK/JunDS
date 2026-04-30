"use client";
import { useState } from "react";
import { ComponentPage, Section, CodeExample, UsageNote } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Button } from "@/ds/primitives/Button";
import { Input } from "@/ds/primitives/Input";
import { Badge } from "@/ds/primitives/Badge";

// Simulate Zod-like validation without importing zod
// (since zod is not a dependency — this shows the pattern)
interface ValidationResult {
  success: boolean;
  errors: Record<string, string>;
}

function validateForm(values: Record<string, string>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!values.name || values.name.length < 2) {
    errors.name = "이름은 2자 이상이어야 합니다";
  }

  if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "올바른 이메일 형식이 아닙니다";
  }

  if (!values.password || values.password.length < 8) {
    errors.password = "비밀번호는 8자 이상이어야 합니다";
  }

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "비밀번호가 일치하지 않습니다";
  }

  if (!values.phone || !/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(values.phone)) {
    errors.phone = "올바른 전화번호 형식이 아닙니다 (010-0000-0000)";
  }

  return { success: Object.keys(errors).length === 0, errors };
}

export default function FormValidationPage() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => new Set(prev).add(field));
    // Validate single field
    const result = validateForm(values);
    if (result.errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: result.errors[field] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateForm(values);
    if (result.success) {
      setSubmitted(true);
      setErrors({});
    } else {
      setErrors(result.errors);
      setTouched(new Set(Object.keys(result.errors)));
    }
  };

  const handleReset = () => {
    setValues({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
    setErrors({});
    setTouched(new Set());
    setSubmitted(false);
  };

  return (
    <ComponentPage
      name="Form Validation"
      description="zodAdapter, useForm, FormField를 조합한 실전 폼 검증 패턴입니다. 실시간 유효성 검사, 필드별 에러 메시지, blur 시 검증을 보여줍니다."
      importPath='import { useForm } from "@/ds/hooks/useForm"'
      status="stable"
      related={[
        { name: "FormWizard", href: "/design-system/patterns/form-wizard" },
        { name: "FormArray", href: "/design-system/patterns/form-array" },
        { name: "Input", href: "/design-system/primitives/input" },
      ]}
    >
      <Section title="라이브 데모" description="필드를 입력하고 blur하면 실시간 검증이 동작합니다.">
        <Preview>
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M8 16l6 6 10-12" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <p className="text-lg font-bold text-foreground mb-1">가입이 완료되었습니다!</p>
              <p className="text-sm text-muted mb-4">{values.name}님, 환영합니다.</p>
              <Button variant="secondary" size="sm" onClick={handleReset}>다시 시도</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div>
                <label htmlFor="form-validation-name" className="block text-sm font-medium text-foreground mb-1">
                  이름 <span className="text-danger">*</span>
                </label>
                <Input
                  id="form-validation-name"
                  value={values.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  placeholder="홍길동"
                  error={!!errors.name}
                />
                {errors.name && touched.has("name") && (
                  <p className="text-xs text-danger mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="form-validation-email" className="block text-sm font-medium text-foreground mb-1">
                  이메일 <span className="text-danger">*</span>
                </label>
                <Input
                  id="form-validation-email"
                  type="email"
                  value={values.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="example@email.com"
                  error={!!errors.email}
                />
                {errors.email && touched.has("email") && (
                  <p className="text-xs text-danger mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="form-validation-password" className="block text-sm font-medium text-foreground mb-1">
                  비밀번호 <span className="text-danger">*</span>
                </label>
                <Input
                  id="form-validation-password"
                  type="password"
                  value={values.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  placeholder="8자 이상"
                  error={!!errors.password}
                />
                {errors.password && touched.has("password") && (
                  <p className="text-xs text-danger mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="form-validation-confirm-password" className="block text-sm font-medium text-foreground mb-1">
                  비밀번호 확인 <span className="text-danger">*</span>
                </label>
                <Input
                  id="form-validation-confirm-password"
                  type="password"
                  value={values.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  placeholder="비밀번호 재입력"
                  error={!!errors.confirmPassword}
                />
                {errors.confirmPassword && touched.has("confirmPassword") && (
                  <p className="text-xs text-danger mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="form-validation-phone" className="block text-sm font-medium text-foreground mb-1">
                  전화번호 <span className="text-danger">*</span>
                </label>
                <Input
                  id="form-validation-phone"
                  type="tel"
                  value={values.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  placeholder="010-0000-0000"
                  error={!!errors.phone}
                />
                {errors.phone && touched.has("phone") && (
                  <p className="text-xs text-danger mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="primary" fullWidth type="submit">
                  가입하기
                </Button>
                <Button variant="secondary" type="button" onClick={handleReset}>
                  초기화
                </Button>
              </div>

              {Object.keys(errors).length > 0 && touched.size > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="danger" size="sm">{Object.keys(errors).length}개 오류</Badge>
                  <span className="text-xs text-muted">모든 필드를 올바르게 입력해주세요</span>
                </div>
              )}
            </form>
          )}
        </Preview>
      </Section>

      <Section title="zodAdapter 사용법" description="Zod 스키마를 useForm의 FormRules로 변환하는 방법입니다.">
        <CodeExample code={`import { z } from "zod";
import { useForm } from "@/ds/hooks/useForm";
import { zodAdapter } from "@/ds/utils/zodAdapter";

// 1. Zod 스키마 정의
const schema = z.object({
  name: z.string().min(2, "이름은 2자 이상"),
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(8, "비밀번호는 8자 이상"),
});

// 2. zodAdapter로 변환
const rules = zodAdapter(schema);

// 3. useForm에 전달
const form = useForm(
  { name: "", email: "", password: "" },
  rules,
);

// 4. 컴포넌트에서 사용
<Input
  value={form.values.name}
  onChange={(e) => form.setValue("name", e.target.value)}
  error={!!form.errors.name}
/>
{form.errors.name && <p>{form.errors.name}</p>}`} />
      </Section>

      <Section title="useForm 직접 사용" description="Zod 없이 커스텀 검증 규칙을 직접 정의하는 방법입니다.">
        <CodeExample code={`import { useForm } from "@/ds/hooks/useForm";

const form = useForm(
  { email: "", age: 0 },
  {
    email: [
      { validate: (v) => !!v || "필수 입력입니다" },
      { validate: (v) => /^[^@]+@[^@]+$/.test(v) || "이메일 형식이 아닙니다" },
    ],
    age: [
      { validate: (v) => v >= 18 || "18세 이상만 가입 가능합니다" },
    ],
  },
);

// form.values, form.errors, form.setValue, form.validate 사용`} />
      </Section>

      <UsageNote type="tip">
        Zod를 사용하지 않는 프로젝트에서는 useForm의 커스텀 규칙을 직접 정의하세요.
        zodAdapter는 Zod가 이미 설치된 프로젝트에서만 사용할 수 있습니다.
      </UsageNote>
    </ComponentPage>
  );
}
