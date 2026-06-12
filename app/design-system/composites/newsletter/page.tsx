"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Newsletter } from "@/ds/composites/Newsletter";

export default function NewsletterPage() {
  return (
    <ComponentPage
      name="Newsletter"
      description="TODO: 1–2문장 설명"
      importPath='import { Newsletter } from "@/ds/composites/Newsletter"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Newsletter title="업데이트 받기" description="주간 소식을 이메일로 받아보세요" variant="card" requireConsent />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
