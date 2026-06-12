"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ChapterList } from "@/ds/composites/ChapterList";

export default function ChapterListPage() {
  return (
    <ComponentPage
      name="ChapterList"
      description="책 목차 — 활성/완독/잠금 상태 + 트리(소단원) 지원, 키보드 접근 가능."
      importPath='import { ChapterList } from "@/ds/composites/ChapterList"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <ChapterList chapters={[{id:"1",title:"1장. 시작",page:1},{id:"2",title:"2장. 본론",page:42,locked:true}]} activeId="1" />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
