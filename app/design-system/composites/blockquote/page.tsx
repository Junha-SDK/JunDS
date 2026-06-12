"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Blockquote } from "@/ds/composites/Blockquote";

export default function BlockquotePage() {
  return (
    <ComponentPage
      name="Blockquote"
      description="TODO: 1–2문장 설명"
      importPath='import { Blockquote } from "@/ds/composites/Blockquote"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Blockquote variant="bordered" cite="아인슈타인">상상력은 지식보다 중요하다.</Blockquote>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
