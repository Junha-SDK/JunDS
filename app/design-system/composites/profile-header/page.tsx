"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ProfileHeader } from "@/ds/composites/ProfileHeader";

export default function ProfileHeaderPage() {
  return (
    <ComponentPage
      name="ProfileHeader"
      description="SNS 프로필 — 배너 + 아바타 + 자기소개 + 통계 + 액션 슬롯(FollowButton 등)."
      importPath='import { ProfileHeader } from "@/ds/composites/ProfileHeader"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <ProfileHeader
            name="준하"
            handle="junha"
            bio="디자인 시스템을 만듭니다"
            location="서울"
            verified
            stats={[
              { label: "팔로워", value: "3.2k" },
              { label: "팔로잉", value: 148 },
            ]}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
