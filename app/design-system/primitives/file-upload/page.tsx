"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FileUpload } from "@/ds/primitives/FileUpload";

export default function FileUploadPage() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <ComponentPage
      name="FileUpload"
      description="파일 업로드. 드래그 앤 드롭과 클릭을 모두 지원합니다."
      importPath='import { FileUpload } from "@/ds/primitives/FileUpload"'
      props={[
        { name: "onFiles", type: "(files: File[]) => void", description: "파일 선택 콜백" },
        { name: "accept", type: "string", description: "허용 파일 타입 (예: image/*)" },
        { name: "multiple", type: "boolean", default: "false", description: "다중 선택" },
        { name: "maxSize", type: "number", description: "최대 파일 크기 (bytes)" },
        { name: "trigger", type: "ReactNode", description: "커스텀 트리거 (없으면 드롭존)" },
        { name: "description", type: "string", description: "드롭존 설명 텍스트" },
        { name: "disabled", type: "boolean", default: "false", description: "비활성화" },
      ]}
    >
      <Section title="드롭존">
        <Preview>
          <div className="max-w-md">
            <FileUpload onFiles={(f) => setFiles(f)} multiple />
            {files.length > 0 && (
              <p className="text-xs text-muted mt-2">
                선택된 파일: {files.map((f) => f.name).join(", ")}
              </p>
            )}
          </div>
        </Preview>
      </Section>

      <Section title="파일 형식 제한">
        <Preview>
          <div className="max-w-md">
            <FileUpload
              onFiles={(f) => setFiles(f)}
              accept="image/*,.pdf"
              description="이미지 또는 PDF 파일만 업로드 가능합니다"
            />
          </div>
        </Preview>
      </Section>

      <Section title="최대 크기 제한">
        <Preview>
          <div className="max-w-md">
            <FileUpload
              onFiles={(f) => setFiles(f)}
              maxSize={5 * 1024 * 1024}
              accept="image/*"
              multiple
            />
          </div>
        </Preview>
      </Section>

      <Section title="비활성화">
        <Preview>
          <div className="max-w-md">
            <FileUpload onFiles={() => {}} disabled />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
