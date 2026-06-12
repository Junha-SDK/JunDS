"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { StoryCircle } from "@/ds/composites/StoryCircle";

export default function StoryCirclePage() {
  return (
    <ComponentPage
      name="StoryCircle"
      description="Instagram 스타일 그라디언트 링 + 상태(unread/read/live/muted)."
      importPath='import { StoryCircle } from "@/ds/composites/StoryCircle"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <StoryCircle name="준하" state="unread" />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
