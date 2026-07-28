"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { CheckboxCardGroup } from "@/ds/composites/CheckboxCardGroup";

export default function CheckboxCardGroupPage() {
  return (
    <ComponentPage
      name="CheckboxCardGroup"
      description="TODO: 1–2문장 설명"
      importPath='import { CheckboxCardGroup } from "@/ds/composites/CheckboxCardGroup"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <CheckboxCardGroup
            options={[
              { value: "e", title: "이메일" },
              { value: "s", title: "SMS" },
              { value: "p", title: "푸시" },
            ]}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
