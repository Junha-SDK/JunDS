"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Image } from "@/ds/primitives/Image";

export default function ImagePage() {
  return (
    <ComponentPage
      name="Image"
      description="TODO: 1–2문장 설명"
      importPath='import { Image } from "@/ds/primitives/Image"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Image />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
