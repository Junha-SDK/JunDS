"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { RadioCardGroup } from "@/ds/composites/RadioCardGroup";

export default function RadioCardGroupPage() {
  return (
    <ComponentPage
      name="RadioCardGroup"
      description="TODO: 1–2문장 설명"
      importPath='import { RadioCardGroup } from "@/ds/composites/RadioCardGroup"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <RadioCardGroup
            options={[
              { value: "a", title: "기본", description: "가벼운 시작" },
              { value: "b", title: "프로", description: "전체 기능" },
            ]}
            defaultValue="a"
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
