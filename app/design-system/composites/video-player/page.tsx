"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { VideoPlayer } from "@/ds/composites/VideoPlayer";

const SAMPLE_SRC =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const SAMPLE_POSTER =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg";

export default function VideoPlayerPage() {
  return (
    <ComponentPage
      name="VideoPlayer"
      description="재생/일시정지, 진행 시크바, 음소거 토글을 갖춘 가벼운 비디오 플레이어. 호버 시 컨트롤이 노출됩니다."
      importPath='import { VideoPlayer } from "@/ds/composites/VideoPlayer"'
      props={[
        { name: "src", type: "string", required: true, description: "비디오 소스 URL" },
        { name: "poster", type: "string", description: "포스터(썸네일) 이미지 URL" },
        { name: "autoPlay", type: "boolean", description: "자동 재생" },
        { name: "muted", type: "boolean", description: "음소거 시작" },
        { name: "loop", type: "boolean", description: "반복 재생" },
        { name: "className", type: "string", description: "추가 클래스" },
      ]}
    >
      <Section title="기본">
        <Preview>
          <div className="w-full max-w-xl">
            <VideoPlayer src={SAMPLE_SRC} poster={SAMPLE_POSTER} />
          </div>
        </Preview>
      </Section>

      <Section title="자동 재생 (음소거)">
        <Preview>
          <div className="w-full max-w-xl">
            <VideoPlayer src={SAMPLE_SRC} poster={SAMPLE_POSTER} autoPlay muted loop />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
