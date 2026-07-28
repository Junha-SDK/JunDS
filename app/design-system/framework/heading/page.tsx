"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Heading } from "@/ds/core";

export default function HeadingPage() {
  return (
    <ComponentPage
      name="Heading"
      description="프레임워크가 강제하는 제목 컴포넌트. raw <h1>~<h6> 대신 사용하여 일관된 크기·무게·간격을 보장합니다."
      importPath='import { Heading } from "@junds/ui/core"'
      props={[
        { name: "level", type: "1|2|3|4|5|6", default: "2", description: "제목 수준 (h1~h6)" },
        { name: "color", type: "ColorToken", description: "텍스트 색상" },
        { name: "align", type: '"left"|"center"|"right"', description: "텍스트 정렬" },
        { name: "truncate", type: "boolean", description: "말줄임" },
      ]}
    >
      <Section title="Level 비교">
        <Preview>
          <div>
            <Heading level={1}>Heading Level 1</Heading>
            <Heading level={2}>Heading Level 2</Heading>
            <Heading level={3}>Heading Level 3</Heading>
            <Heading level={4}>Heading Level 4</Heading>
            <Heading level={5}>Heading Level 5</Heading>
            <Heading level={6}>Heading Level 6</Heading>
          </div>
        </Preview>
      </Section>
      <Section title="Color">
        <Preview>
          <div>
            <Heading level={3} color="primary">
              Primary 색상 제목
            </Heading>
            <Heading level={3} color="danger">
              Danger 색상 제목
            </Heading>
            <Heading level={3} color="success">
              Success 색상 제목
            </Heading>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
