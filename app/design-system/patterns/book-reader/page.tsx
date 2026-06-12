"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { BookReader } from "@/ds/patterns/BookReader";

const chapters = [
  { id: "ch-1", title: "1장. 시작", page: 1 },
  { id: "ch-2", title: "2장. 본론", page: 42 },
  { id: "ch-3", title: "3장. 노이즈", page: 86 },
  { id: "ch-4", title: "4장. 결론", page: 220, locked: true },
];

export default function BookReaderPage() {
  const [active, setActive] = useState("ch-3");
  const [bookmarked, setBookmarked] = useState(false);
  return (
    <ComponentPage
      name="BookReader"
      description="좌측 목차 + 본문 + 상단 진행률을 묶은 책 리더 화면."
      importPath='import { BookReader } from "@/ds/patterns/BookReader"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <BookReader
            title="모비 딕"
            author="허먼 멜빌"
            chapters={chapters}
            activeChapterId={active}
            onChapterChange={setActive}
            currentPage={86}
            totalPages={312}
            bookmarked={bookmarked}
            onBookmarkChange={setBookmarked}
          >
            <h2 id="opening">3장. 노이즈</h2>
            <p>나를 이슈마엘이라 불러라. 몇 해 전, 정확히 얼마인지는 중요치 않다…</p>
            <p>긴 본문이 이어지며, 페이지 진행률이 상단에 표시된다.</p>
          </BookReader>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
