"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { AnnotationNote } from "@/ds/composites/AnnotationNote";

export default function AnnotationNotePage() {
  return (
    <ComponentPage
      name="AnnotationNote"
      description="본문 인용 + 사용자 메모 카드 — 5가지 색 하이라이트, 페이지/날짜 메타."
      importPath='import { AnnotationNote } from "@/ds/composites/AnnotationNote"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <AnnotationNote quote="우리는 가장 작은 디테일에서 디자인을 본다." note="첫 챕터 핵심" page={142} color="yellow" createdAt={new Date()} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
