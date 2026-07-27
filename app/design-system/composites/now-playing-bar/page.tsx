"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { NowPlayingBar } from "@/ds/composites/NowPlayingBar";
import { useAudioPlayer, type PlayerTrack } from "@/ds/hooks";

const TRACKS: PlayerTrack[] = [
  { slug: "a", title: "첫 번째 곡", artist: "junha", src: "" },
  { slug: "b", title: "두 번째 곡", artist: "junha", src: "" },
];

export default function NowPlayingBarPage() {
  const player = useAudioPlayer(TRACKS);

  return (
    <ComponentPage
      name="NowPlayingBar"
      description="하단 재생 바 — 커버·곡 정보·파형 스크러버·이전/재생/다음. useAudioPlayer 상태를 그대로 받는다."
      importPath='import { NowPlayingBar } from "@/ds/composites/NowPlayingBar"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full">
            <button
              type="button"
              onClick={() => player.play(0)}
              className="mb-3 rounded-lg border border-border px-3 py-1.5 text-sm"
            >
              트랙 선택 (바 표시)
            </button>
            {/* fixed 를 끄면 문서 흐름 안에서 미리보기할 수 있다 */}
            <NowPlayingBar player={player} fixed={false} className="rounded-xl border" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
