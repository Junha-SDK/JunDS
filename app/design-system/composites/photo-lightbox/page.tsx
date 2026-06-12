"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PhotoLightbox } from "@/ds/composites/PhotoLightbox";

export default function PhotoLightboxPage() {
  return (
    <ComponentPage
      name="PhotoLightbox"
      description="TODO: 1–2문장 설명"
      importPath='import { PhotoLightbox } from "@/ds/composites/PhotoLightbox"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PhotoLightbox open={false} index={0} onClose={()=>{}} onIndexChange={()=>{}} photos={[{src:"https://picsum.photos/seed/l1/800/600",alt:"1"}]} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
