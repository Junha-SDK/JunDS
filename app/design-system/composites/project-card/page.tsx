"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ProjectCard } from "@/ds/composites/ProjectCard";
import { Badge } from "@/ds/primitives/Badge";

export default function ProjectCardPage() {
  return (
    <ComponentPage
      name="ProjectCard"
      description="프로젝트 한 줄 카드. 행 전체가 링크가 되며, onPrefetch 로 상세 페이지를 미리 받아 둘 수 있다."
      importPath='import { ProjectCard } from "@/ds/composites/ProjectCard"'
      props={[]}
    >
      <Section title="Row">
        <Preview>
          <div className="flex w-full flex-col gap-2">
            <ProjectCard title="JunDS" subtitle="디자인 시스템" meta="2024—" href="#" />
            <ProjectCard
              title="MySelf"
              subtitle="개인 사이트 · 블로그 · 독스"
              meta="2023—"
              href="#"
              badges={<Badge>OSS</Badge>}
            />
            <ProjectCard title="아카이브" subtitle="링크 없음 — 정적 카드" meta="2022" />
          </div>
        </Preview>
      </Section>

      <Section title="Feature">
        <Preview>
          <div className="w-full">
            <ProjectCard
              variant="feature"
              title="JunDS"
              subtitle="프리미티브 50 · 컴포짓 190 · 패턴 39"
              meta="2024—"
              href="#"
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
