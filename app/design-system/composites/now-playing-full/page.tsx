"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { NowPlayingFull } from "@/ds/composites/NowPlayingFull";
import { useAudioPlayer, type PlayerTrack } from "@/ds/hooks";

const TRACKS: PlayerTrack[] = [
  { slug: "rain", title: "창밖에 비", artist: "junha", src: "" },
  { slug: "night", title: "밤의 끝", artist: "junha", src: "" },
];

const LYRICS = `창밖에 비가 내리고
나는 아직 여기 있어

시간은 흘러가는데
마음만 그대로야`;

export default function NowPlayingFullPage() {
  const player = useAudioPlayer(TRACKS);
  const [open, setOpen] = useState(false);

  return (
    <ComponentPage
      name="NowPlayingFull"
      description="전체 화면 Now Playing — 커버색으로 물든 배경·큰 커버·파형·가사. NowPlayingBar와 같은 재생 상태를 공유한다."
      importPath='import { NowPlayingFull } from "@/ds/composites/NowPlayingFull"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <button
            type="button"
            onClick={() => {
              player.play(0);
              setOpen(true);
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
          >
            전체 화면 플레이어 열기
          </button>
        </Preview>
      </Section>

      <NowPlayingFull
        open={open}
        onClose={() => setOpen(false)}
        player={player}
        lyrics={LYRICS}
      />
    </ComponentPage>
  );
}
