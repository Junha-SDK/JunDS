"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { BookCard } from "@/ds/composites/BookCard";

export default function BookCardPage() {
  return (
    <ComponentPage
      name="BookCard"
      description="책 표지 스타일의 카드 컴포넌트. 광택 효과, 그레인 텍스처, 잠금 상태를 지원합니다."
      importPath='import { BookCard } from "@/ds/composites/BookCard"'
      props={[
        { name: "title", type: "string", description: "책 제목" },
        { name: "author", type: "string", description: "저자 이름" },
        { name: "coverImage", type: "string", description: "커버 이미지 URL" },
        { name: "locked", type: "boolean", default: "false", description: "잠금 상태" },
        { name: "kind", type: "string", description: "작품 유형 (예: 소설, 에세이)" },
        { name: "onClick", type: "() => void", description: "클릭 핸들러" },
        { name: "className", type: "string", description: "추가 CSS 클래스" },
      ]}
    >
      <Section title="기본">
        <Preview>
          <div className="max-w-[180px]">
            <BookCard title="디자인 시스템 구축하기" author="김디자인" kind="기술서" />
          </div>
        </Preview>
      </Section>

      <Section title="잠금 상태">
        <Preview>
          <div className="grid grid-cols-2 gap-4 max-w-[400px]">
            <BookCard title="공개된 챕터" author="이작가" kind="소설" />
            <BookCard title="프리미엄 콘텐츠" author="박작가" kind="에세이" locked />
          </div>
        </Preview>
      </Section>

      <Section title="다양한 카드">
        <Preview>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <BookCard title="리액트 완벽 가이드" author="김리액트" kind="기술서" />
            <BookCard title="밤의 도서관" author="최소설" kind="소설" />
            <BookCard title="커피 한 잔의 여유" author="정에세이" kind="에세이" locked />
            <BookCard title="우주의 끝에서" author="한SF" kind="SF" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
