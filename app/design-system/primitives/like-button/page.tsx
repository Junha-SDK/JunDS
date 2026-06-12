"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { LikeButton } from "@/ds/primitives/LikeButton";

export default function LikeButtonPage() {
  return (
    <ComponentPage
      name="LikeButton"
      description="좋아요 토글 — 하트 채움 + 살짝 스케일, motion-reduce 대응."
      importPath='import { LikeButton } from "@/ds/primitives/LikeButton"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <LikeButton liked={true} onChange={()=>{}} count={42} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
