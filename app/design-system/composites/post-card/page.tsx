"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PostCard } from "@/ds/composites/PostCard";

export default function PostCardPage() {
  return (
    <ComponentPage
      name="PostCard"
      description="SNS 게시물 — 작성자 + 본문 + (선택) 미디어 + 좋아요/댓글/공유 액션 바."
      importPath='import { PostCard } from "@/ds/composites/PostCard"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PostCard
            author={{ name: "준하", handle: "junha", verified: true }}
            content="새 컴포넌트 30종 추가했습니다 🎉"
            createdAt={new Date()}
            likes={42}
            comments={8}
            liked
            onLike={() => {}}
            onComment={() => {}}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
