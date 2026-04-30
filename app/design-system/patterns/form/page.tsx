"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Form } from "@/ds/patterns/Form";
import { Input } from "@/ds/primitives/Input";
import { Label } from "@/ds/primitives/Label";
import { Button } from "@/ds/primitives/Button";

interface Values {
  name: string;
  email: string;
}

function FormDemo() {
  const [values, setValues] = useState<Values>({ name: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Values | null>(null);

  const handleChange = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value as string }));
  };

  const handleSubmit = () => {
    const next: Record<string, string> = {};
    if (!values.name) next.name = "이름을 입력해주세요";
    if (!values.email.includes("@")) next.email = "올바른 이메일을 입력해주세요";
    setErrors(next);
    if (Object.keys(next).length === 0) setSubmitted(values);
  };

  return (
    <Form values={values as unknown as Record<string, unknown>} errors={errors} onChange={handleChange} onSubmit={handleSubmit} className="max-w-sm">
      <div className="flex flex-col gap-1">
        <Label htmlFor="form-name" required>이름</Label>
        <Input
          id="form-name"
          value={values.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={!!errors.name}
        />
        {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="form-email" required>이메일</Label>
        <Input
          id="form-email"
          type="email"
          value={values.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={!!errors.email}
        />
        {errors.email && <p className="text-xs text-danger">{errors.email}</p>}
      </div>
      <Button type="submit">제출</Button>
      {submitted && (
        <p className="text-xs text-success font-mono">제출됨: {JSON.stringify(submitted)}</p>
      )}
    </Form>
  );
}

export default function FormPage() {
  return (
    <ComponentPage
      name="Form"
      description="값/에러/터치 상태를 외부에서 주입하는 제어형 폼 컨테이너입니다. useFormContext 훅으로 자식이 상태에 접근할 수 있습니다."
      importPath='import { Form } from "@/ds/patterns/Form"'
      props={[
        { name: "values", type: "Record<string, unknown>", description: "현재 폼 값 객체." },
        { name: "errors", type: "Record<string, string>", description: "필드별 오류 메시지." },
        { name: "touched", type: "Record<string, boolean>", description: "필드별 터치 상태." },
        { name: "onChange", type: "(name: string, value: unknown) => void", description: "필드 값 변경 핸들러." },
        { name: "onBlur", type: "(name: string) => void", description: "필드 blur 핸들러." },
        { name: "onSubmit", type: "() => void", description: "submit 이벤트 핸들러 (preventDefault 자동 처리)." },
        { name: "children", type: "ReactNode", description: "폼 필드와 버튼." },
        { name: "className", type: "string", description: "form 요소에 적용되는 CSS 클래스." },
      ]}
    >
      <Section title="Basic" description="제어형 상태로 검증과 제출을 처리하는 예시입니다.">
        <Preview>
          <FormDemo />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
