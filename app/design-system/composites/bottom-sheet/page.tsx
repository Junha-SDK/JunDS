"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { BottomSheet } from "@/ds/composites/BottomSheet";
import { Button } from "@/ds/primitives/Button";

export default function BottomSheetPage() {
  const [open, setOpen] = useState(false);
  const [halfOpen, setHalfOpen] = useState(false);

  return (
    <ComponentPage
      name="BottomSheet"
      description="화면 하단에서 슬라이드 업 되는 시트. 모바일에서 모달 대신 사용합니다."
      importPath='import { BottomSheet } from "@/ds/composites/BottomSheet"'
      props={[
        { name: "open", type: "boolean", required: true, description: "열림 상태" },
        { name: "onClose", type: "() => void", required: true, description: "닫기 핸들러" },
        { name: "title", type: "string", description: "헤더 제목" },
        {
          name: "height",
          type: '"auto"|"half"|"full"',
          default: '"auto"',
          description: "시트 높이",
        },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="flex gap-2">
            <Button onClick={() => setOpen(true)}>Auto height</Button>
            <Button variant="secondary" onClick={() => setHalfOpen(true)}>
              Half height
            </Button>
          </div>
          <BottomSheet open={open} onClose={() => setOpen(false)} title="설정">
            <div className="space-y-3 text-sm">
              <p>여기에 설정 옵션이나 폼을 배치할 수 있습니다.</p>
              <p className="text-muted">콘텐츠 높이에 맞춰 시트가 자동으로 늘어납니다.</p>
            </div>
          </BottomSheet>
          <BottomSheet
            open={halfOpen}
            onClose={() => setHalfOpen(false)}
            title="50% 높이"
            height="half"
          >
            <p className="text-sm text-muted">화면의 절반을 차지하는 시트입니다.</p>
          </BottomSheet>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
