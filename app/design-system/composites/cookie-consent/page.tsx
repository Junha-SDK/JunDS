"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { CookieConsent } from "@/ds/composites/CookieConsent";

export default function CookieConsentPage() {
  return (
    <ComponentPage
      name="CookieConsent"
      description="TODO: 1–2문장 설명"
      importPath='import { CookieConsent } from "@/ds/composites/CookieConsent"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <CookieConsent />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
