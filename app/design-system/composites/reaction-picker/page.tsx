"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ReactionPicker } from "@/ds/composites/ReactionPicker";

export default function ReactionPickerPage() {
  return (
    <ComponentPage
      name="ReactionPicker"
      description="클릭 시 이모지 바 펼침 — 단일 선택, 키보드 접근, 외부 클릭 닫힘."
      importPath='import { ReactionPicker } from "@/ds/composites/ReactionPicker"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <ReactionPicker />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
