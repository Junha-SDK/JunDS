# Recipe — Modal with Validated Form

## Goal

사용자가 새 항목을 추가하거나 편집할 때 페이지 이동 없이 모달 안에서 폼을 입력하게
하고 싶다. 모달은 ESC와 백드롭 클릭으로 닫히고(`dismissible`), 폼은
`FormField`로 라벨/에러/힌트를 일관되게 표시하며 Submit/Cancel 액션이
`Modal.Footer`에 정렬되어야 한다. 이 레시피는 그 골격을 제공한다.

## Used components

- `Modal`, `Modal.Header`, `Modal.Footer` — `@/ds/composites/Modal`
- `Form` — `@/ds/patterns/Form`
- `FormField` — `@/ds/composites/FormField`
- `Input` — `@/ds/primitives/Input`
- `Button` — `@/ds/primitives/Button`

Props 검증: `.ai/props.json` → composites → Modal / FormField, primitives →
Input / Button, patterns → Form. `Modal.Header` 는 `onClose`만 받고,
`Modal.Footer` 는 `children`만 받는다는 점에 유의한다.

## Recipe

```tsx
"use client";
import { useState } from "react";
import { Modal } from "@/ds/composites/Modal";
import { Form } from "@/ds/patterns/Form";
import { FormField } from "@/ds/composites/FormField";
import { Input } from "@/ds/primitives/Input";
import { Button } from "@/ds/primitives/Button";

interface ProjectFormValues {
  name: string;
  slug: string;
}

export default function CreateProjectModal() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ProjectFormValues>({ name: "", slug: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (v: ProjectFormValues) => {
    const next: Record<string, string> = {};
    if (!v.name.trim()) next.name = "이름을 입력해주세요";
    if (!/^[a-z0-9-]+$/.test(v.slug)) next.slug = "소문자/숫자/하이픈만 가능합니다";
    return next;
  };

  const handleChange = (name: string, value: unknown) => {
    const nextValues = { ...values, [name]: value as string };
    setValues(nextValues);
    setErrors(validate(nextValues));
  };

  const handleBlur = (name: string) => {
    setTouched((t) => ({ ...t, [name]: true }));
  };

  const handleSubmit = () => {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched({ name: true, slug: true });
    if (Object.keys(nextErrors).length === 0) {
      // TODO: 실제 저장 호출
      setOpen(false);
    }
  };

  const showError = (key: keyof ProjectFormValues) => touched[key] ? errors[key] : undefined;

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>새 프로젝트</Button>

      <Modal open={open} onClose={() => setOpen(false)} size="md" dismissible>
        <Modal.Header onClose={() => setOpen(false)}>새 프로젝트 만들기</Modal.Header>

        <div className="px-6 py-5">
          <Form
            values={values as unknown as Record<string, unknown>}
            errors={errors}
            touched={touched}
            onChange={handleChange}
            onBlur={handleBlur}
            onSubmit={handleSubmit}
          >
            <FormField label="프로젝트 이름" required error={showError("name")} htmlFor="name">
              <Input
                id="name"
                placeholder="예: 디자인 시스템"
                value={values.name}
                error={!!showError("name")}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
              />
            </FormField>

            <FormField label="슬러그" required error={showError("slug")} hint="URL에 사용됩니다." htmlFor="slug">
              <Input
                id="slug"
                placeholder="my-project"
                value={values.slug}
                error={!!showError("slug")}
                onChange={(e) => handleChange("slug", e.target.value)}
                onBlur={() => handleBlur("slug")}
              />
            </FormField>
          </Form>
        </div>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setOpen(false)}>취소</Button>
          <Button variant="primary" onClick={handleSubmit}>만들기</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
```

## Variations

- **삭제 확인 다이얼로그** — `size="sm"`, `dismissible={false}`로 두고 폼 대신
  설명 문장만 두면 destructive confirm 패턴이 된다. `Button variant="danger"`로
  바꾼다.
- **Zod 검증** — `validate()` 내부에서 `ds/utils/zodAdapter.ts` 의
  스키마 어댑터를 호출하면 스키마 기반 에러 객체로 교체할 수 있다.
- **비동기 저장** — `Button` 의 `loading` prop과 로컬 `submitting` 상태를 묶어
  중복 제출을 방지한다. 이 동안 `dismissible={false}`를 강제하면 더 안전하다.
- **드로어로 교체** — 우측 슬라이드 인 폼이 더 어울린다면 `Modal` 대신
  `@/ds/composites/Drawer`를 사용한다. API 시그니처가 거의 동일하다.

## See also

- 쇼케이스: `/design-system/composites/modal`,
  `/design-system/patterns/form`, `/design-system/composites/form-field`
- 관련 레시피: `./form-wizard.md` (다단계 폼), `./settings-page.md` (인라인 폼)
- 요구사항: `requirements/design-system-library.md`
- 소스: `/Users/junha/develop/jjunhaa/JunDS/ds/composites/Modal/Modal.tsx`,
  `/Users/junha/develop/jjunhaa/JunDS/ds/patterns/Form/Form.tsx`
