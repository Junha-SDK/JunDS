"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { AudioPlayer } from "@/ds/composites/AudioPlayer";

export default function AudioPlayerPage() {
  return (
    <ComponentPage
      name="AudioPlayer"
      description="간단한 오디오 재생 컴포넌트. 재생/일시정지, 시크 바, 시간 표시를 제공합니다."
      importPath='import { AudioPlayer } from "@/ds/composites/AudioPlayer"'
      props={[
        { name: "src", type: "string", required: true, description: "오디오 파일 URL" },
        { name: "title", type: "string", description: "트랙 제목" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="max-w-md w-full">
            <AudioPlayer
              src="https://www.w3schools.com/html/horse.mp3"
              title="샘플 오디오 - Horse"
            />
          </div>
        </Preview>
      </Section>

      <Section title="제목 없이">
        <Preview>
          <div className="max-w-md w-full">
            <AudioPlayer src="https://www.w3schools.com/html/horse.mp3" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
