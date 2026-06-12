"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PollCard } from "@/ds/composites/PollCard";

export default function PollCardPage() {
  return (
    <ComponentPage
      name="PollCard"
      description="투표 카드 — 단일 선택 + 결과 막대 + 마감 표시."
      importPath='import { PollCard } from "@/ds/composites/PollCard"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PollCard question="가장 좋아하는 디자인 시스템은?" options={[{id:"a",label:"JunDS",votes:42},{id:"b",label:"기타",votes:8}]} closesIn="2일 남음" />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
