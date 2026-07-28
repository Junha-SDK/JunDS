"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FormField } from "@/ds/composites/FormField";
import { Input } from "@/ds/primitives/Input";

export default function FormFieldPage() {
  return (
    <ComponentPage
      name="FormField"
      description="라벨, 입력, 힌트, 에러 메시지를 한 단위로 묶는 폼 필드 래퍼."
      importPath='import { FormField } from "@/ds/composites/FormField"'
      props={[
        { name: "label", type: "string", description: "필드 상단 라벨" },
        { name: "required", type: "boolean", description: "필수 표시(*) 여부" },
        {
          name: "error",
          type: "string",
          description: "에러 메시지. 존재하면 hint 대신 표시됩니다.",
        },
        { name: "hint", type: "string", description: "보조 설명 텍스트" },
        { name: "htmlFor", type: "string", description: "라벨이 가리킬 input id" },
        { name: "children", type: "ReactNode", description: "Input 등 폼 컨트롤" },
        { name: "className", type: "string", description: "컨테이너 클래스" },
      ]}
    >
      <Section title="Variants">
        <Preview>
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <FormField label="이름" required htmlFor="name" hint="실명을 입력해주세요.">
              <Input id="name" placeholder="홍길동" />
            </FormField>
            <FormField label="이메일" htmlFor="email" error="유효한 이메일 주소가 아닙니다.">
              <Input id="email" defaultValue="invalid-email" />
            </FormField>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
