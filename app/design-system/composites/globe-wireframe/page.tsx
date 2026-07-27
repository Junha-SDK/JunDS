"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { GlobeWireframe } from "@/ds/composites/GlobeWireframe";

export default function GlobeWireframePage() {
  return (
    <ComponentPage
      name="GlobeWireframe"
      description="캔버스 와이어프레임 지구본. 드래그로 돌릴 수 있고, 뒤로 넘어간 선은 깊이에 따라 흐려진다."
      importPath='import { GlobeWireframe } from "@/ds/composites/GlobeWireframe"'
      props={[]}
    >
      <Section title="Draggable">
        <Preview>
          <div className="rounded-2xl bg-gray-900 p-4">
            <GlobeWireframe size={320} ariaLabel="지구본" />
          </div>
        </Preview>
      </Section>

      <Section title="Dense grid">
        <Preview>
          <div className="rounded-2xl bg-gray-900 p-4">
            <GlobeWireframe
              size={320}
              latitudes={14}
              longitudes={24}
              maxOpacity={0.22}
              autoRotate={0.004}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
