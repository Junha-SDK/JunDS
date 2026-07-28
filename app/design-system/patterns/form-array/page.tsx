"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FormArray } from "@/ds/patterns/FormArray";
import { Input } from "@/ds/primitives/Input";

interface Contact {
  name: string;
  phone: string;
}

function FormArrayDemo() {
  const [items, setItems] = useState<Contact[]>([{ name: "홍길동", phone: "010-1111-2222" }]);

  return (
    <div className="max-w-md">
      <FormArray
        value={items}
        onChange={setItems}
        defaultItem={{ name: "", phone: "" }}
        minItems={1}
        maxItems={5}
        addLabel="연락처 추가"
        renderItem={(item, _i, { update }) => (
          <div className="flex gap-2">
            <Input
              placeholder="이름"
              value={item.name}
              onChange={(e) => update({ ...item, name: e.target.value })}
            />
            <Input
              placeholder="전화번호"
              value={item.phone}
              onChange={(e) => update({ ...item, phone: e.target.value })}
            />
          </div>
        )}
      />
    </div>
  );
}

export default function FormArrayPage() {
  return (
    <ComponentPage
      name="FormArray"
      description="동적으로 추가/삭제 가능한 반복 필드를 위한 패턴입니다. minItems/maxItems 제한, renderItem prop으로 행을 직접 구성합니다."
      importPath='import { FormArray } from "@/ds/patterns/FormArray"'
      props={[
        { name: "value", type: "T[]", description: "현재 항목 배열." },
        { name: "onChange", type: "(value: T[]) => void", description: "배열 변경 콜백." },
        {
          name: "defaultItem",
          type: "T",
          description: "추가 시 사용할 기본 항목 (structuredClone으로 복제).",
        },
        {
          name: "renderItem",
          type: "(item, index, { remove, update }) => ReactNode",
          description: "각 행을 렌더링하는 함수.",
        },
        {
          name: "minItems",
          type: "number",
          default: "0",
          description: "최소 항목 수 (이하로 줄지 않음).",
        },
        { name: "maxItems", type: "number", description: "최대 항목 수 (이상 추가 불가)." },
        {
          name: "addLabel",
          type: "string",
          default: '"항목 추가"',
          description: "추가 버튼 라벨.",
        },
        { name: "className", type: "string", description: "추가 CSS 클래스." },
      ]}
    >
      <Section title="Basic" description="연락처 목록을 동적으로 추가/삭제하는 예시입니다.">
        <Preview>
          <FormArrayDemo />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
