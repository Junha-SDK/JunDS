"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { LoadingButton } from "@/ds/composites/LoadingButton";

export default function LoadingButtonPage() {
  return (
    <ComponentPage
      name="LoadingButton"
      description="TODO: 1–2문장 설명"
      importPath='import { LoadingButton } from "@/ds/composites/LoadingButton"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <LoadingButton />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
