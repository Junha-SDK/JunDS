"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { EmojiReaction } from "@/ds/composites/EmojiReaction";

export default function EmojiReactionPage() {
  return (
    <ComponentPage
      name="EmojiReaction"
      description="TODO: 1–2문장 설명"
      importPath='import { EmojiReaction } from "@/ds/composites/EmojiReaction"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <EmojiReaction reactions={[{emoji:"👍",count:5,reactedByMe:true},{emoji:"🎉",count:2}]} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
