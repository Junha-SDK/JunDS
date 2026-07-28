"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { BookmarkButton } from "@/ds/primitives/BookmarkButton";

export default function BookmarkButtonPage() {
  return (
    <ComponentPage
      name="BookmarkButton"
      description="북마크 토글 아이콘 — 활성 시 채움, aria-pressed 처리."
      importPath='import { BookmarkButton } from "@/ds/primitives/BookmarkButton"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <BookmarkButton bookmarked={true} onChange={() => {}} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
