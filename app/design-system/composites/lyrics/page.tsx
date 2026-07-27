"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Lyrics } from "@/ds/composites/Lyrics";

const SAMPLE = `창밖에 비가 내리고
나는 아직 여기 있어

시간은 흘러가는데
마음만 그대로야

언젠가 웃으면서
이 밤을 이야기할까`;

export default function LyricsPage() {
  const [progress, setProgress] = useState(0.4);

  return (
    <ComponentPage
      name="Lyrics"
      description="연 단위로 강조되는 가사 뷰. 진행률을 주면 현재 연만 밝게 두고 그 연으로 자동 스크롤한다."
      importPath='import { Lyrics } from "@/ds/composites/Lyrics"'
      props={[]}
    >
      <Section title="Progress-synced">
        <Preview>
          <div className="w-full">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="mb-4 w-full"
              aria-label="재생 진행률"
            />
            <Lyrics text={SAMPLE} progress={progress} className="max-h-64" />
          </div>
        </Preview>
      </Section>

      <Section title="Centered, no highlight">
        <Preview>
          <Lyrics text={SAMPLE} centered className="w-full max-h-64" />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
