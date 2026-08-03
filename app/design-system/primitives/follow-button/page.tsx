"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FollowButton } from "@/ds/primitives/FollowButton";

export default function FollowButtonPage() {
  return (
    <ComponentPage
      name="FollowButton"
      description="팔로우/팔로잉/언팔로우(hover) 3-state 토글."
      importPath='import { FollowButton } from "@/ds/primitives/FollowButton"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <FollowButton following={false} onChange={() => {}} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
