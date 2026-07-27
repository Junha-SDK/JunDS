"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { DocHero } from "@/ds/composites/DocHero";

export default function DocHeroPage() {
  return (
    <ComponentPage
      name="DocHero"
      description="문서/프로젝트 상세 상단 히어로 — 배너·아이콘·제목·기술 칩·지표 스트립."
      importPath='import { DocHero } from "@/ds/composites/DocHero"'
      props={[]}
    >
      <Section title="Flat">
        <Preview>
          <div className="w-full">
            <DocHero
              eyebrow="라이브러리"
              title="JunDS"
              subtitle="레고처럼 조합하는 프로덕션 레디 디자인 프레임워크"
              date="2024—"
              tags={["React", "TypeScript", "Tailwind"]}
              stats={[
                { label: "컴포넌트", value: "313" },
                { label: "훅", value: "61" },
                { label: "테스트", value: "748" },
                { label: "a11y 위반", value: "0" },
              ]}
            />
          </div>
        </Preview>
      </Section>

      <Section title="With banner">
        <Preview>
          <div className="w-full">
            <DocHero
              banner="https://placehold.co/1200x400/1a1726/ffffff?text=+"
              eyebrow="프로젝트"
              title="MySelf"
              subtitle="개인 사이트 — 블로그 · 독스 · 포트폴리오"
              tags={["React 19", "Vite", "Vercel"]}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
