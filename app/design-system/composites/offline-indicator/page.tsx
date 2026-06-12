"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { OfflineIndicator } from "@/ds/composites/OfflineIndicator";

export default function OfflineIndicatorPage() {
  return (
    <ComponentPage
      name="OfflineIndicator"
      description="TODO: 1–2문장 설명"
      importPath='import { OfflineIndicator } from "@/ds/composites/OfflineIndicator"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <OfflineIndicator />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
