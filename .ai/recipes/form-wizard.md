# Recipe — Form Wizard (3 Steps)

## Goal

회원가입·온보딩처럼 입력을 단계별로 받을 때 `FormWizard` 한 컴포넌트만으로
스텝 진행, 검증, "이전 / 다음 / 완료" 네비게이션이 모두 처리된다. 본 레시피는
3-step 사용 예시를 보여주고, 시각적 진행을 위한 별도 `Stepper` 노출
방식까지 함께 다룬다.

## Used components

- `FormWizard`, `useWizard` — `@/ds/patterns/FormWizard`
- `Stepper` — `@/ds/composites/Stepper` (선택적, 외부에 별도 진행 표시)
- `FormField` — `@/ds/composites/FormField`
- `Input` — `@/ds/primitives/Input`
- `Select` — `@/ds/composites/Select`
- `Checkbox` — `@/ds/primitives/Checkbox`

Props 검증: `.ai/props.json` → patterns → FormWizard, composites → Stepper /
FormField / Select, primitives → Input / Checkbox. `FormWizardStep.validate`
는 `true` 또는 에러 문자열을 반환해야 한다(false 도 일반 메시지로 처리됨).

## Recipe

```tsx
"use client";
import { FormWizard, useWizard, type FormWizardStep } from "@/ds/patterns/FormWizard";
import { FormField } from "@/ds/composites/FormField";
import { Input } from "@/ds/primitives/Input";
import { Select } from "@/ds/composites/Select";
import { Checkbox } from "@/ds/primitives/Checkbox";

function StepAccount() {
  const { data, setData } = useWizard();
  const email = (data.email as string) ?? "";
  const password = (data.password as string) ?? "";
  return (
    <div className="space-y-4">
      <FormField label="이메일" required htmlFor="email">
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setData("email", e.target.value)}
          placeholder="name@example.com"
        />
      </FormField>
      <FormField label="비밀번호" required htmlFor="password" hint="8자 이상 입력하세요.">
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setData("password", e.target.value)}
        />
      </FormField>
    </div>
  );
}

function StepProfile() {
  const { data, setData } = useWizard();
  const name = (data.name as string) ?? "";
  const role = (data.role as string) ?? "";
  return (
    <div className="space-y-4">
      <FormField label="이름" required htmlFor="name">
        <Input id="name" value={name} onChange={(e) => setData("name", e.target.value)} />
      </FormField>
      <FormField label="직무" required>
        <Select
          options={[
            { value: "designer", label: "디자이너" },
            { value: "developer", label: "개발자" },
            { value: "pm", label: "PM" },
          ]}
          value={role}
          onChange={(v) => setData("role", v)}
          placeholder="직무 선택"
        />
      </FormField>
    </div>
  );
}

function StepConfirm() {
  const { data, setData } = useWizard();
  const agreed = Boolean(data.agreed);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {String(data.email)} / {String(data.name)} 으로 계정을 만듭니다.
      </p>
      <Checkbox
        checked={agreed}
        onChange={(e) => setData("agreed", e.target.checked)}
        label="이용약관과 개인정보 처리방침에 동의합니다."
      />
    </div>
  );
}

export default function SignupWizard() {
  const steps: FormWizardStep[] = [
    {
      title: "계정 만들기",
      description: "로그인에 사용할 이메일과 비밀번호",
      content: <StepAccount />,
      validate: (d) => {
        if (!d.email || !/^[^@]+@[^@]+\.[^@]+$/.test(String(d.email)))
          return "올바른 이메일을 입력하세요";
        if (!d.password || String(d.password).length < 8)
          return "비밀번호는 8자 이상이어야 합니다";
        return true;
      },
    },
    {
      title: "프로필",
      description: "표시 이름과 직무",
      content: <StepProfile />,
      validate: (d) => (d.name && d.role ? true : "이름과 직무를 입력하세요"),
    },
    {
      title: "확인",
      description: "정보가 맞는지 확인하세요",
      content: <StepConfirm />,
      validate: (d) => (d.agreed ? true : "약관에 동의해 주세요"),
    },
  ];

  return (
    <FormWizard
      steps={steps}
      onComplete={(data) => {
        // TODO: 회원가입 API 호출
        console.log("회원가입 데이터", data);
      }}
    />
  );
}
```

## Variations

- **헤더에 별도 Stepper 노출** — `FormWizard` 가 자체 미니 스텝퍼를 그리지만,
  좀 더 큰 단계 표시가 필요하면 위쪽에 `Stepper` 를 두고 `useWizard().current`
  를 `current` prop 으로 전달한다.
- **세로 진행** — `Stepper direction="vertical"` 로 좌측 사이드바 형태의
  체크리스트로 만든다.
- **저장 후 재개** — `useLocalStorage`(`@/ds/hooks/useLocalStorage`) 와
  `useWizard().data` 를 결합해 새로고침해도 입력이 보존되게 한다.
- **비동기 검증** — `validate` 는 동기적이다. API 검증이 필요하다면 다음
  단계로 이동하는 로직을 별도 버튼으로 분리하고 자체 폼 컨테이너를 사용한다.

## See also

- 쇼케이스: `/design-system/patterns/form-wizard`,
  `/design-system/composites/stepper`, `/design-system/composites/form-field`
- 관련 레시피: `./modal-with-form.md`, `./login-screen.md`
- 요구사항: `requirements/design-system-library.md`,
  `requirements/license-and-auth.md` (회원가입 흐름)
- 소스: `/Users/junha/develop/jjunhaa/JunDS/ds/patterns/FormWizard/FormWizard.tsx`,
  `/Users/junha/develop/jjunhaa/JunDS/ds/composites/Stepper/Stepper.tsx`
