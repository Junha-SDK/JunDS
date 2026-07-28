"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { TestimonialCard } from "@/ds/composites/TestimonialCard";

export default function TestimonialCardPage() {
  return (
    <ComponentPage
      name="TestimonialCard"
      description="TODO: 1–2문장 설명"
      importPath='import { TestimonialCard } from "@/ds/composites/TestimonialCard"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <TestimonialCard
            variant="card"
            quote="이 디자인 시스템은 정말 빠르고 직관적입니다."
            rating={5}
            authorName="홍길동"
            authorRole="CTO @ Acme"
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
