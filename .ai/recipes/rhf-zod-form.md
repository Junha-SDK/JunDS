# Recipe — React Hook Form + Zod with JunDS

## Goal

JunDS 폼 컴포넌트는 controlled 입력을 가정한다 — 그래서 React Hook Form
(uncontrolled 우선)과 결합하려면 **`Controller`로 한 번 감싸는** 패턴이 표준이다.
이 레시피는 Zod 스키마 + RHF + JunDS Input/Select/Checkbox/Switch를 한 곳에
묶어 보여준다.

## Used components

- `Form`, `FormField` — `@/ds/patterns/Form` (라벨 + 에러 슬롯 통일)
- `Input`, `Checkbox`, `Switch`, `Textarea` — `@/ds/primitives/*`
- `Select` — `@/ds/composites/Select`
- `Button` — `@/ds/primitives/Button`

외부 의존성: `react-hook-form` + `zod` + `@hookform/resolvers/zod`. JunDS는 이
패키지들을 강제하지 않으므로 사용자 프로젝트에서 선택적으로 설치한다.

```bash
npm i react-hook-form zod @hookform/resolvers
```

## Recipe

```tsx
"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField } from "@/ds/patterns/Form";
import { Input } from "@/ds/primitives/Input";
import { Checkbox } from "@/ds/primitives/Checkbox";
import { Switch } from "@/ds/primitives/Switch";
import { Textarea } from "@/ds/primitives/Textarea";
import { Select } from "@/ds/composites/Select";
import { Button } from "@/ds/primitives/Button";

const Schema = z.object({
  email: z.string().email("이메일 형식이 아닙니다"),
  name: z.string().min(2, "최소 2자"),
  role: z.enum(["admin", "member", "viewer"]),
  bio: z.string().max(280).optional(),
  notifications: z.boolean(),
  agree: z.literal(true, { errorMap: () => ({ message: "약관에 동의해야 합니다" }) }),
});

type Values = z.infer<typeof Schema>;

export function ProfileForm({ onSubmit }: { onSubmit: (v: Values) => Promise<void> }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: {
      email: "",
      name: "",
      role: "member",
      bio: "",
      notifications: true,
      agree: false as never,
    },
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormField label="이메일" error={errors.email?.message} required>
        <Input
          type="email"
          placeholder="you@team.com"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </FormField>

      <FormField label="이름" error={errors.name?.message} required>
        <Input aria-invalid={!!errors.name} {...register("name")} />
      </FormField>

      {/* 컨트롤드 컴포넌트는 Controller로 감싼다 */}
      <FormField label="권한" error={errors.role?.message} required>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: "admin", label: "관리자" },
                { value: "member", label: "구성원" },
                { value: "viewer", label: "뷰어" },
              ]}
            />
          )}
        />
      </FormField>

      <FormField label="소개 (선택)" error={errors.bio?.message}>
        <Textarea rows={3} {...register("bio")} />
      </FormField>

      <FormField label="알림 수신">
        <Controller
          name="notifications"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={field.onChange}
              label="이메일로 받기"
            />
          )}
        />
      </FormField>

      <FormField error={errors.agree?.message}>
        <Controller
          name="agree"
          control={control}
          render={({ field }) => (
            <Checkbox
              checked={!!field.value}
              onChange={(c) => field.onChange(c)}
              label="이용 약관에 동의합니다"
            />
          )}
        />
      </FormField>

      <Button type="submit" loading={isSubmitting} variant="primary">
        저장
      </Button>
    </Form>
  );
}
```

## 핵심 결정과 근거

- **register vs Controller** — `<input>`/`<textarea>`처럼 native ref만 필요한
  컴포넌트는 `register("name")`로 충분. Switch/Checkbox/Select처럼 `value`
  prop이 native input이 아닌 컴포넌트는 반드시 `Controller`로 감싼다. JunDS의
  Input/Textarea는 ref-forwarding되므로 register만으로 동작한다.
- **에러 표면화** — `aria-invalid` + `FormField error`는 시각/스크린리더 양쪽에
  같은 신호를 준다. 이 둘을 함께 두는 것이 a11y strict CI 통과의 전제.
- **resolver 선택** — Zod 외 Valibot도 가능. JunDS 자체는 `valibot`만 dependency
  로 가지므로, RHF + Valibot 조합도 동일 패턴으로 작성한다 (`valibotResolver`).

## Variations

- **서버 에러 표시**: `setError("email", { message: "이미 사용 중" })` →
  `errors.email.message`로 자동 표시
- **자동 포커스 첫 에러**: RHF의 `shouldFocusError: true`(기본값)와 JunDS Input의
  ref가 호환됨, 추가 작업 불필요
- **단계별 검증** — `FormWizard` 안에서 단계마다 `trigger("fieldName")` 호출

## See also

- `requirements/compound-api.md` — Slot/createCompound 규약
- `.ai/recipes/modal-with-form.md` — 모달 + 폼 변형
- `.ai/recipes/checkout-flow.md` — 위저드 + 폼 변형
