"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { MentionChip } from "@/ds/primitives/MentionChip";

export default function MentionChipPage() {
  return (
    <ComponentPage
      name="MentionChip"
      description="`@username` 링크 칩 — 인증 마크 옵션 포함, 게시물 본문 안의 정적 멘션 표시 전용."
      importPath='import { MentionChip } from "@/ds/primitives/MentionChip"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <MentionChip handle="junha" verified href="#" />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
