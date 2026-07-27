"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Waveform } from "@/ds/composites/Waveform";

export default function WaveformPage() {
  const [progress, setProgress] = useState(0.35);

  return (
    <ComponentPage
      name="Waveform"
      description="시드에서 결정적으로 만든 막대 파형. 재생 진행분이 강조색으로 차오르고, onSeek 을 주면 클릭·드래그·방향키로 탐색할 수 있다."
      importPath='import { Waveform } from "@/ds/composites/Waveform"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Waveform seed="track-01" progress={0.4} className="w-full" />
        </Preview>
      </Section>

      <Section title="Seekable">
        <Preview>
          <Waveform
            seed="track-02"
            progress={progress}
            playing
            onSeek={setProgress}
            className="w-full"
          />
        </Preview>
      </Section>

      <Section title="Seeds">
        <Preview>
          <div className="flex w-full flex-col gap-3">
            {["봄", "여름", "가을", "겨울"].map((s) => (
              <Waveform key={s} seed={s} progress={0.6} bars={40} className="w-full" />
            ))}
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
