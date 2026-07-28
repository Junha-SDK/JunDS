"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { KeyCap } from "@/ds/primitives/KeyCap";

export default function KeyCapPage() {
  return (
    <ComponentPage
      name="KeyCap"
      description="TODO: 1–2문장 설명"
      importPath='import { KeyCap } from "@/ds/primitives/KeyCap"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <>
            <KeyCap>⌘</KeyCap> <KeyCap>K</KeyCap>
          </>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
