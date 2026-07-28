"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { BlogPost } from "@/ds/patterns/BlogPost";

export default function BlogPostPage() {
  return (
    <ComponentPage
      name="BlogPost"
      description="TODO: 1–2문장 설명"
      importPath='import { BlogPost } from "@/ds/patterns/BlogPost"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <BlogPost
            title="JunDS 소개"
            excerpt="에이전트 친화 디자인 시스템"
            author={{ name: "홍길동" }}
            publishedAt="2026-04-30"
            readingMinutes={5}
          >
            본문
          </BlogPost>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
