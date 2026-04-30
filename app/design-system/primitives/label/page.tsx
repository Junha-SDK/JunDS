"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Label } from "@/ds/primitives/Label";
import { Input } from "@/ds/primitives/Input";

export default function LabelPage() {
  return (
    <ComponentPage
      name="Label"
      description="폼 컨트롤에 연결되는 라벨입니다. required prop이 true이면 빨간색 별표 표시가 추가됩니다."
      importPath='import { Label } from "@/ds/primitives/Label"'
      props={[
        { name: "htmlFor", type: "string", description: "연결할 폼 컨트롤의 id." },
        { name: "required", type: "boolean", default: "false", description: "필수 입력 표시 (별표)." },
        { name: "className", type: "string", description: "추가 CSS 클래스." },
        { name: "children", type: "ReactNode", description: "라벨 텍스트." },
      ]}
    >
      <Section title="Basic" description="기본 라벨과 required 라벨 예시입니다.">
        <Preview>
          <div className="flex flex-col gap-3 max-w-xs">
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">이름</Label>
              <Input id="name" placeholder="홍길동" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="email" required>이메일</Label>
              <Input id="email" type="email" placeholder="user@example.com" />
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
