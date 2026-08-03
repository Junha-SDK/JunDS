"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ExifPanel } from "@/ds/composites/ExifPanel";

export default function ExifPanelPage() {
  return (
    <ComponentPage
      name="ExifPanel"
      description="카메라/렌즈/노출 정보를 카드 또는 한 줄로 표시."
      importPath='import { ExifPanel } from "@/ds/composites/ExifPanel"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <ExifPanel
            data={{
              camera: "Sony α7 IV",
              lens: "24-70 GM",
              focalLength: "50mm",
              aperture: "f/2.8",
              shutter: "1/250",
              iso: 200,
            }}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
