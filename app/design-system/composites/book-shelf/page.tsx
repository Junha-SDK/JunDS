"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { BookShelf } from "@/ds/composites/BookShelf";

export default function BookShelfPage() {
  return (
    <ComponentPage
      name="BookShelf"
      description="동일 너비 그리드로 책 카드를 정렬하는 책장 — wood/minimal/card 변형, 라벨 슬롯 지원."
      importPath='import { BookShelf } from "@/ds/composites/BookShelf"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <BookShelf>책 카드들…</BookShelf>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
