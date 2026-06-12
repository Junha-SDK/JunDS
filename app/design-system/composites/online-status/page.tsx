"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { OnlineStatus } from "@/ds/composites/OnlineStatus";

export default function OnlineStatusPage() {
  return (
    <ComponentPage
      name="OnlineStatus"
      description="TODO: 1–2문장 설명"
      importPath='import { OnlineStatus } from "@/ds/composites/OnlineStatus"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <OnlineStatus status="online" showLabel pulse />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
