"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { AlbumArt } from "@/ds/composites/AlbumArt";

export default function AlbumArtPage() {
  return (
    <ComponentPage
      name="AlbumArt"
      description="앨범/트랙 커버. 이미지가 없거나 깨지면 시드에서 만든 무광 그라디언트 커버로 대신한다."
      importPath='import { AlbumArt } from "@/ds/composites/AlbumArt"'
      props={[]}
    >
      <Section title="Generative fallback">
        <Preview>
          <div className="flex gap-3">
            {["김광석 - 서른 즈음에", "이소라 - 바람이 분다", "정미조 - 개여울"].map((s) => (
              <AlbumArt key={s} seed={s} size={96} />
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="Radius">
        <Preview>
          <div className="flex items-center gap-3">
            <AlbumArt seed="sm" size={64} radius="sm" />
            <AlbumArt seed="md" size={64} radius="md" />
            <AlbumArt seed="lg" size={64} radius="lg" />
            <AlbumArt seed="full" size={64} radius="full" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
