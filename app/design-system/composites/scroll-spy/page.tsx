"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ScrollSpy } from "@/ds/composites/ScrollSpy";

const sections = [
  { key: "intro", label: "소개", targetId: "spy-section-intro" },
  { key: "install", label: "설치 방법", targetId: "spy-section-install" },
  { key: "usage", label: "사용법", targetId: "spy-section-usage" },
  { key: "api", label: "API 참조", targetId: "spy-section-api" },
  { key: "faq", label: "FAQ", targetId: "spy-section-faq" },
];

export default function ScrollSpyPage() {
  return (
    <ComponentPage
      name="ScrollSpy"
      description="스크롤 위치에 따라 현재 보이는 섹션을 하이라이트하는 네비게이션 컴포넌트입니다."
      importPath='import { ScrollSpy } from "@/ds/composites/ScrollSpy"'
      props={[
        {
          name: "sections",
          type: "ScrollSpySection[]",
          required: true,
          description: "섹션 목록 ({ key, label, targetId })",
        },
        { name: "offset", type: "number", default: "80", description: "스크롤 오프셋 (px)" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <div className="flex gap-6">
            <ScrollSpy sections={sections} />
            <div className="flex-1 space-y-8">
              {sections.map((section) => (
                <div
                  key={section.key}
                  id={section.targetId}
                  className="border border-border rounded-lg p-6"
                >
                  <h3 className="text-base font-semibold mb-2">{section.label}</h3>
                  <p className="text-sm text-muted">
                    이 섹션은 &quot;{section.label}&quot; 영역입니다. 페이지를 스크롤하면 좌측
                    네비게이션에서 현재 보이는 섹션이 하이라이트됩니다.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
