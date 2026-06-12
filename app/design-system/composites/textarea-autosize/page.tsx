"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { TextareaAutosize } from "@/ds/composites/TextareaAutosize";

export default function TextareaAutosizePage() {
  return (
    <ComponentPage
      name="TextareaAutosize"
      description="TODO: 1–2문장 설명"
      importPath='import { TextareaAutosize } from "@/ds/composites/TextareaAutosize"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <TextareaAutosize />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
