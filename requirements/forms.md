# Forms

- **Slug:** `forms`
- **Status:** active
- **Owner:** goodjunha@gmail.com
- **Last updated:** 2026-05-04

## Goal

JunDS는 외부 폼 라이브러리(RHF, Formik 등)를 강제하지 않는다. 자체 `useForm`
훅(이미 존재)으로 작은 폼을, 외부 라이브러리(RHF + valibot/zod)를 사용하는
복잡한 폼은 `Controller` 패턴으로 통합한다. 두 경로 모두 권장되고 문서화되어
있어야 한다.

## Scope

**In scope**
- `ds/hooks/useForm.ts` — 기존 자체 훅 (required/minLength/pattern/validate 4종 룰)
- `ds/patterns/Form` + `ds/patterns/Form/FormField` — 라벨 + 에러 슬롯 통일
- 외부 통합 레시피:
  - `.ai/recipes/rhf-zod-form.md` — RHF + Zod
  - `.ai/recipes/form-validation.md` — 자체 useForm + valibot
- 모든 form primitive(Input/Textarea/Switch/Checkbox/Select/...)는 controlled
  + uncontrolled 모두 지원

**Out of scope**
- 폼 빌더 GUI (no-code 캔버스) — `ds/patterns/FormBuilder`가 별도 담당
- 서버 사이드 검증 — 호출자 책임

## User stories / acceptance criteria

- [x] **As a 사용자** I can `useForm({ initial, rules })`로 작은 로그인 폼을
  외부 의존 0으로 만들 수 있다.
- [x] **As a 사용자** I can RHF + Zod 사용자라면 `Controller`로 JunDS Switch/
  Select/Checkbox를 그대로 묶을 수 있다 (recipe 제공).
- [x] **As a 시각장애인** I can 모든 폼 컴포넌트가 `aria-invalid`,
  `aria-errormessage`, `aria-required`를 자동 처리하는 것을 본다.
- [x] **As a 사용자** I can valibot 사용자라면 같은 controller 패턴으로
  적용한다 (라이브러리 dep는 valibot 1.x).

## Design / behavior notes

- **register vs Controller**: native ref만 필요한 컴포넌트(Input/Textarea)는
  `register`. value-prop 컴포넌트(Switch/Select/...)는 반드시 `Controller`.
- **에러 메시지**: `<FormField error={...}>`가 메시지를 표시 + 자식 input의
  `aria-invalid`를 자동 동기화 (FormField가 자식 cloneElement).
- **submit 가드**: `useForm`은 모든 룰 통과 시에만 `onSubmit` 호출. 외부 검증
  실패는 `setError(field, message)`로 다시 통보.

## Touched files (for agents)

- `ds/hooks/useForm.ts`
- `ds/patterns/Form/Form.tsx`
- `.ai/recipes/rhf-zod-form.md`

## Open questions

- **schema-first 폼**: zod/valibot 스키마 한 줄로 자동 폼 생성 — `FormBuilder`
  와 결합할지 별도 패턴(`SchemaForm`)으로 분리할지.
- **다단계 폼**: `FormWizard` 패턴이 이미 존재. `useForm` 통합은 호출자 측에서
  단계마다 `trigger()`.

## Changelog

- 2026-05-04 — created.
