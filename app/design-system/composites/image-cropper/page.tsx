"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ImageCropper } from "@/ds/composites/ImageCropper";

const SAMPLE = "https://picsum.photos/seed/junds/600/400";

export default function ImageCropperPage() {
  const [result, setResult] = useState<string | null>(null);
  return (
    <ComponentPage
      name="ImageCropper"
      description="드래그 가능한 사각형 영역으로 이미지를 자르는 도구. 자르기 결과는 dataURL로 콜백됩니다."
      importPath='import { ImageCropper } from "@/ds/composites/ImageCropper"'
      props={[
        { name: "src", type: "string", description: "원본 이미지 URL" },
        { name: "aspectRatio", type: "number", default: "1", description: "결과 영역의 가로/세로 비율" },
        { name: "onCrop", type: "(dataUrl: string) => void", description: "자르기 버튼 클릭 시 결과 콜백" },
        { name: "className", type: "string", description: "컨테이너 클래스" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="flex flex-wrap gap-6 items-start">
            <div className="w-80">
              <ImageCropper src={SAMPLE} aspectRatio={1} onCrop={setResult} />
            </div>
            <div className="text-sm">
              <p className="font-medium mb-2">결과</p>
              {result ? (
                <img src={result} alt="cropped" className="w-32 h-32 rounded-lg border border-border object-cover" />
              ) : (
                <div className="w-32 h-32 rounded-lg border border-dashed border-border flex items-center justify-center text-xs text-muted">미리보기</div>
              )}
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
