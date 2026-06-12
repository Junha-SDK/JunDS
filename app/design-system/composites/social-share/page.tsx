"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SocialShare } from "@/ds/composites/SocialShare";

export default function SocialSharePage() {
  return (
    <ComponentPage
      name="SocialShare"
      description="TODO: 1–2문장 설명"
      importPath='import { SocialShare } from "@/ds/composites/SocialShare"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <SocialShare url="https://example.com" title="JunDS" />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
