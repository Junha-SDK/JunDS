"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SocialFeed } from "@/ds/patterns/SocialFeed";

export default function SocialFeedPage() {
  return (
    <ComponentPage
      name="SocialFeed"
      description="상단 가로 스토리 바 + 무한 스크롤 게시물 리스트 + EmptyState 자동 처리."
      importPath='import { SocialFeed } from "@/ds/patterns/SocialFeed"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <SocialFeed
            stories={[
              { id: "1", name: "준하", state: "unread" },
              { id: "2", name: "지우", state: "live" },
              { id: "3", name: "민호", state: "read" },
            ]}
            onStoryClick={() => {}}
          >
            <div className="text-sm text-muted text-center py-8">PostCard 리스트가 여기에 표시됩니다</div>
          </SocialFeed>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
