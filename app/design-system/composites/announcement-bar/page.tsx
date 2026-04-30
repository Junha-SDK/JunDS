"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { AnnouncementBar } from "@/ds/composites/AnnouncementBar";

export default function AnnouncementBarPage() {
  return (
    <ComponentPage
      name="AnnouncementBar"
      description="TODO: 1–2문장 설명"
      importPath='import { AnnouncementBar } from "@/ds/composites/AnnouncementBar"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <AnnouncementBar />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
