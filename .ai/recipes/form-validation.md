# Recipe — Form Validation (자체 useForm + Valibot)

## Goal

작은 폼 — RHF/Zod 같은 큰 의존 없이 JunDS 자체 `useForm` 훅과 (옵션) valibot
스키마를 묶어 가장 가벼운 검증 폼을 만든다.

## Used components

- `useForm` — `@/ds/hooks/useForm` (자체 훅, 외부 dep 없음)
- `Form`, `FormField` — `@/ds/patterns/Form`
- `Input`, `Button` — primitive
- `valibot` — peer-dep으로 이미 설치됨 (선택 사용)

## Option A — useForm 단독 (외부 dep 0)

```tsx
"use client";
import { useForm } from "@/ds/hooks/useForm";
import { Form } from "@/ds/patterns/Form";
import { Input } from "@/ds/primitives/Input";
import { Button } from "@/ds/primitives/Button";

export function LoginForm({ onSubmit }: { onSubmit: (v: { email: string; password: string }) => Promise<void> }) {
  const form = useForm({
    initial: { email: "", password: "" },
    rules: {
      email: {
        required: "이메일을 입력하세요",
        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "이메일 형식이 아닙니다" },
      },
      password: {
        required: "비밀번호를 입력하세요",
        minLength: { value: 8, message: "최소 8자" },
      },
    },
    onSubmit,
  });

  return (
    <Form onSubmit={form.handleSubmit}>
      <label className="block">
        <span className="text-sm">이메일</span>
        <Input
          type="email"
          value={form.values.email}
          onChange={(e) => form.setValue("email", e.target.value)}
          aria-invalid={!!form.errors.email}
        />
        {form.errors.email && <p className="text-xs text-danger mt-1">{form.errors.email}</p>}
      </label>
      <label className="block mt-3">
        <span className="text-sm">비밀번호</span>
        <Input
          type="password"
          value={form.values.password}
          onChange={(e) => form.setValue("password", e.target.value)}
          aria-invalid={!!form.errors.password}
        />
        {form.errors.password && <p className="text-xs text-danger mt-1">{form.errors.password}</p>}
      </label>
      <Button type="submit" loading={form.isSubmitting} className="mt-4">로그인</Button>
    </Form>
  );
}
```

## Option B — valibot 스키마 + 사용자 정의 validate

```tsx
"use client";
import * as v from "valibot";
import { useForm } from "@/ds/hooks/useForm";
import { Input } from "@/ds/primitives/Input";
import { Button } from "@/ds/primitives/Button";

const Schema = v.object({
  email: v.pipe(v.string(), v.email("이메일 형식 오류")),
  age: v.pipe(v.number(), v.minValue(13, "13세 이상")),
});

type Values = v.InferOutput<typeof Schema>;

function valibotValidator<T>(schema: v.GenericSchema<unknown, T>) {
  return (value: unknown) => {
    const r = v.safeParse(schema, value);
    return r.success ? undefined : r.issues[0]?.message;
  };
}

export function ProfileForm() {
  const form = useForm<Values>({
    initial: { email: "", age: 0 },
    rules: {
      email: { validate: valibotValidator(v.pipe(v.string(), v.email("이메일 형식 오류"))) },
      age: { validate: valibotValidator(v.pipe(v.number(), v.minValue(13, "13세 이상"))) },
    },
    onSubmit: async (values) => {
      // values는 정확히 Values 타입
      await fetch("/api/profile", { method: "POST", body: JSON.stringify(values) });
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-3">
      <Input
        type="email"
        value={form.values.email}
        onChange={(e) => form.setValue("email", e.target.value)}
        aria-invalid={!!form.errors.email}
        placeholder="이메일"
      />
      {form.errors.email && <p className="text-xs text-danger">{form.errors.email}</p>}

      <Input
        type="number"
        value={form.values.age || ""}
        onChange={(e) => form.setValue("age", Number(e.target.value))}
        aria-invalid={!!form.errors.age}
        placeholder="나이"
      />
      {form.errors.age && <p className="text-xs text-danger">{form.errors.age}</p>}

      <Button type="submit" loading={form.isSubmitting}>저장</Button>
    </form>
  );
}
```

## 언제 어느 쪽?

- **단순 폼 (필드 ≤ 5, 룰 ≤ 5)** — Option A (useForm 단독)
- **복잡한 폼 / 외부 라이브러리 표준 사용 중** — RHF + Zod (`.ai/recipes/rhf-zod-form.md`)
- **JunDS 안에서 valibot 사용 중인 팀** — Option B

## See also

- `requirements/forms.md`
- `.ai/recipes/rhf-zod-form.md`
- `.ai/recipes/checkout-flow.md` — `FormWizard` + 폼 결합
