"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FAQ } from "@/ds/patterns/FAQ";

export default function FAQPage() {
  return (
    <ComponentPage
      name="FAQ"
      description="TODO: 1–2문장 설명"
      importPath='import { FAQ } from "@/ds/patterns/FAQ"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <FAQ title="자주 묻는 질문" items={[{question:"환불은?",answer:"7일 내 가능"},{question:"무료 체험?",answer:"14일 무료"}]} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
