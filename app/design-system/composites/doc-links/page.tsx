"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { DocLinks } from "@/ds/composites/DocLinks";

export default function DocLinksPage() {
  return (
    <ComponentPage
      name="DocLinks"
      description="문서에 딸린 외부 링크 목록. 종류를 URL에서 추론해 아이콘을 붙인다."
      importPath='import { DocLinks } from "@/ds/composites/DocLinks"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full max-w-md">
            <DocLinks
              links={[
                { href: "https://github.com/jjunhaa0211/JunDS", label: "Repository", badge: "GitHub" },
                { href: "https://apps.apple.com/app/id000000", label: "App Store", badge: "Apple" },
                { href: "https://www.npmjs.com/package/@junds/ui", label: "@junds/ui", badge: "npm" },
                { href: "https://www.junome.info", label: "junome.info" },
              ]}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
