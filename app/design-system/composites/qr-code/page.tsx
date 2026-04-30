"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { QRCode } from "@/ds/composites/QRCode";

export default function QRCodePage() {
  return (
    <ComponentPage
      name="QRCode"
      description="입력 문자열을 시각적인 QR 코드 패턴으로 렌더링합니다(데모용 비실제 인코딩)."
      importPath='import { QRCode } from "@/ds/composites/QRCode"'
      props={[
        { name: "value", type: "string", description: "QR로 표현할 문자열" },
        { name: "size", type: "number", default: "128", description: "픽셀 크기" },
        { name: "color", type: "string", default: '"#000000"', description: "전경 색상" },
        { name: "bgColor", type: "string", default: '"#ffffff"', description: "배경 색상" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="flex items-center gap-6">
            <QRCode value="https://junds.dev" />
            <QRCode value="hello-junds" size={96} />
            <QRCode value="brand" size={128} color="var(--primary)" bgColor="#f5f3ff" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
