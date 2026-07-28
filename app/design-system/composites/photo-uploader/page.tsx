"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PhotoUploader } from "@/ds/composites/PhotoUploader";

export default function PhotoUploaderPage() {
  return (
    <ComponentPage
      name="PhotoUploader"
      description="드래그 앤 드롭 + 클릭 + 미리보기 그리드, 개수/크기 제한."
      importPath='import { PhotoUploader } from "@/ds/composites/PhotoUploader"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PhotoUploader onAdd={() => {}} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
