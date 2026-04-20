"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ButtonGroup } from "@/ds/composites/ButtonGroup";
import { Button } from "@/ds/primitives/Button";

export default function ButtonGroupPage() {
  return (
    <ComponentPage
      name="ButtonGroup"
      description="버튼 그룹. 관련된 버튼들을 하나의 그룹으로 묶어 표시합니다."
      importPath='import { ButtonGroup } from "@/ds/composites/ButtonGroup"'
      props={[
        { name: "children", type: "ReactNode", description: "버튼 요소들" },
        { name: "separated", type: "boolean", default: "false", description: "버튼 간 간격 분리" },
        { name: "fullWidth", type: "boolean", default: "false", description: "전체 너비" },
      ]}
    >
      <Section title="연결된 그룹">
        <Preview>
          <ButtonGroup>
            <Button variant="secondary">왼쪽</Button>
            <Button variant="secondary">중앙</Button>
            <Button variant="secondary">오른쪽</Button>
          </ButtonGroup>
        </Preview>
      </Section>

      <Section title="분리된 그룹">
        <Preview>
          <ButtonGroup separated>
            <Button variant="secondary">일간</Button>
            <Button variant="primary">주간</Button>
            <Button variant="secondary">월간</Button>
          </ButtonGroup>
        </Preview>
      </Section>

      <Section title="전체 너비">
        <Preview>
          <div className="max-w-md">
            <ButtonGroup fullWidth separated>
              <Button variant="secondary" fullWidth>목록</Button>
              <Button variant="secondary" fullWidth>보드</Button>
              <Button variant="secondary" fullWidth>캘린더</Button>
            </ButtonGroup>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
