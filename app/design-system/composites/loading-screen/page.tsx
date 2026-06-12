"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { LoadingScreen } from "@/ds/composites/LoadingScreen";

export default function LoadingScreenPage() {
  return (
    <ComponentPage
      name="LoadingScreen"
      description="TODO: 1–2문장 설명"
      importPath='import { LoadingScreen } from "@/ds/composites/LoadingScreen"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <LoadingScreen />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
