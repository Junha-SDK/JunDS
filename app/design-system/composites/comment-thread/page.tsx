"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { CommentThread } from "@/ds/composites/CommentThread";

export default function CommentThreadPage() {
  return (
    <ComponentPage
      name="CommentThread"
      description="중첩 댓글 — 좋아요·답글 + 깊이 제한 + 시간 상대 표시."
      importPath='import { CommentThread } from "@/ds/composites/CommentThread"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <CommentThread comments={[{id:"1",authorName:"준하",body:"좋네요",likes:2,liked:true}]} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
