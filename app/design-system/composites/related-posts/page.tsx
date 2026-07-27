"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { RelatedPosts } from "@/ds/composites/RelatedPosts";

const POSTS = [
  { id: "1", title: "Spring의 @Transactional은 언제 안 걸리나", category: "Backend" },
  { id: "2", title: "SwiftUI 뷰가 다시 그려지는 조건", category: "iOS" },
  { id: "3", title: "인덱스가 있는데도 풀스캔이 도는 이유", category: "DB" },
  { id: "4", title: "번들 크기를 절반으로 줄인 과정", category: "Frontend" },
];

export default function RelatedPostsPage() {
  return (
    <ComponentPage
      name="RelatedPosts"
      description="글 하단의 연관 글 목록. 목록이 비면 섹션 자체가 사라져 빈 제목만 남지 않는다."
      importPath='import { RelatedPosts } from "@/ds/composites/RelatedPosts"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full">
            <RelatedPosts posts={POSTS} />
          </div>
        </Preview>
      </Section>

      <Section title="Single column">
        <Preview>
          <div className="w-full">
            <RelatedPosts posts={POSTS} columns={1} max={2} title="이어서 읽기" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
