"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Popover } from "@/ds/composites/Popover";
import { Button } from "@/ds/primitives/Button";

export default function PopoverPage() {
  return (
    <ComponentPage
      name="Popover"
      description="트리거를 클릭하면 그 옆에 떠오르는 가벼운 패널입니다. 메뉴, 폼, 미니 카드 등에 활용합니다."
      importPath='import { Popover } from "@/ds/composites/Popover"'
      props={[
        { name: "trigger", type: "ReactNode", description: "팝오버를 여는 트리거 요소" },
        { name: "content", type: "ReactNode", description: "팝오버 내부 내용" },
        { name: "align", type: '"left"|"right"|"center"', default: '"left"', description: "수평 정렬" },
        { name: "side", type: '"top"|"bottom"', default: '"bottom"', description: "트리거 기준 방향" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <Popover
            trigger={<Button>옵션 열기</Button>}
            content={
              <div className="w-56 space-y-2">
                <p className="text-sm font-semibold">필터</p>
                <p className="text-xs text-muted">정렬 기준이나 보기 옵션을 선택하세요.</p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm">적용</Button>
                  <Button size="sm" variant="secondary">초기화</Button>
                </div>
              </div>
            }
          />
        </Preview>
      </Section>

      <Section title="정렬과 방향">
        <Preview>
          <div className="flex gap-3 flex-wrap">
            <Popover trigger={<Button variant="secondary">left</Button>} content={<p className="text-xs">왼쪽 정렬</p>} align="left" />
            <Popover trigger={<Button variant="secondary">center</Button>} content={<p className="text-xs">가운데 정렬</p>} align="center" />
            <Popover trigger={<Button variant="secondary">right</Button>} content={<p className="text-xs">오른쪽 정렬</p>} align="right" />
            <Popover trigger={<Button variant="secondary">top</Button>} content={<p className="text-xs">위쪽으로 표시</p>} side="top" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
