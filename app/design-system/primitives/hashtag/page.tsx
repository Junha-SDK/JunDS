"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Hashtag } from "@/ds/primitives/Hashtag";

export default function HashtagPage() {
  return (
    <ComponentPage
      name="Hashtag"
      description=" 링크 칩 — 인기/게시물 수 표시 옵션."
      importPath='import { Hashtag } from "@/ds/primitives/Hashtag"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Hashtag tag="디자인시스템" trending count={3214} href="#" />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
