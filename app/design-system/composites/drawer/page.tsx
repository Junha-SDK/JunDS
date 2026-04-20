"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Drawer } from "@/ds/composites/Drawer";
import { Button } from "@/ds/primitives/Button";

export default function DrawerPage() {
  const [rightOpen, setRightOpen] = useState(false);
  const [bottomOpen, setBottomOpen] = useState(false);

  return (
    <ComponentPage
      name="Drawer"
      description="슬라이드 인 패널. 사이드 또는 하단에서 추가 콘텐츠를 표시합니다."
      importPath='import { Drawer } from "@/ds/composites/Drawer"'
      props={[
        { name: "open", type: "boolean", description: "열림 상태" },
        { name: "onClose", type: "() => void", description: "닫기 핸들러" },
        { name: "side", type: '"left"|"right"|"bottom"', default: '"right"', description: "방향" },
        { name: "size", type: '"sm"|"md"|"lg"|"xl"', default: '"md"', description: "크기" },
        { name: "title", type: "string", description: "헤더 타이틀" },
        { name: "footer", type: "ReactNode", description: "푸터 영역" },
        { name: "dismissible", type: "boolean", default: "true", description: "배경 클릭으로 닫기" },
      ]}
    >
      <Section title="오른쪽 Drawer">
        <Preview>
          <Button onClick={() => setRightOpen(true)}>오른쪽 Drawer 열기</Button>
          <Drawer
            open={rightOpen}
            onClose={() => setRightOpen(false)}
            side="right"
            title="필터 설정"
            footer={
              <>
                <Button variant="secondary" onClick={() => setRightOpen(false)}>취소</Button>
                <Button onClick={() => setRightOpen(false)}>적용</Button>
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted">여기에 필터 옵션이나 세부 정보를 표시할 수 있습니다.</p>
              <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center text-sm text-muted">
                콘텐츠 영역
              </div>
            </div>
          </Drawer>
        </Preview>
      </Section>

      <Section title="하단 Drawer">
        <Preview>
          <Button variant="secondary" onClick={() => setBottomOpen(true)}>하단 Drawer 열기</Button>
          <Drawer
            open={bottomOpen}
            onClose={() => setBottomOpen(false)}
            side="bottom"
            title="상세 정보"
            size="md"
          >
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted">하단에서 올라오는 패널입니다.</p>
              <div className="grid grid-cols-3 gap-3">
                {["항목 A", "항목 B", "항목 C"].map((item) => (
                  <div key={item} className="h-20 bg-gray-50 rounded-lg flex items-center justify-center text-sm text-muted">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Drawer>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
