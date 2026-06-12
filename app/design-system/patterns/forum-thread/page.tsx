"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ForumThread } from "@/ds/patterns/ForumThread";

export default function ForumThreadPage() {
  return (
    <ComponentPage
      name="ForumThread"
      description="TODO: 1–2문장 설명"
      importPath='import { ForumThread } from "@/ds/patterns/ForumThread"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <ForumThread title="React 19 use() 사용법" tags={["react","hook"]} opening={{id:"op",authorName:"준하",body:"use 훅 어떻게 쓰나요?",createdAt:Date.now()-86400000,upvotes:5}} answers={[{id:"a1",authorName:"지우",authorRole:"모더레이터",body:"이렇게 씁니다…",createdAt:Date.now()-3600000,upvotes:12,accepted:true}]} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
