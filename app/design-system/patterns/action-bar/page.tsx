"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ActionBar } from "@/ds/patterns/ActionBar";
import { Button } from "@/ds/primitives/Button";

const sampleItems = [
  { id: "1", name: "프로젝트 A 기획서" },
  { id: "2", name: "디자인 시스템 가이드" },
  { id: "3", name: "API 명세서" },
  { id: "4", name: "테스트 보고서" },
  { id: "5", name: "배포 체크리스트" },
];

export default function ActionBarPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === sampleItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sampleItems.map((i) => i.id)));
    }
  };

  return (
    <ComponentPage
      name="ActionBar"
      description="플로팅 액션 바. 여러 항목을 선택한 후 벌크 액션을 수행할 때 사용합니다."
      importPath='import { ActionBar } from "@/ds/patterns/ActionBar"'
      props={[
        { name: "count", type: "number", description: "선택된 항목 수" },
        { name: "open", type: "boolean", description: "표시 여부" },
        { name: "actions", type: "ReactNode", description: "액션 버튼들" },
        { name: "onClear", type: "() => void", description: "선택 해제 핸들러" },
      ]}
    >
      <Section title="체크박스 선택 데모">
        <Preview>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.size === sampleItems.length}
                onChange={toggleAll}
                className="rounded"
              />
              <span className="text-xs text-muted font-medium">전체 선택</span>
            </label>
            {sampleItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggle(item.id)}
                  className="rounded"
                />
                <span className="text-sm">{item.name}</span>
              </label>
            ))}
          </div>
        </Preview>
      </Section>

      <ActionBar
        open={selected.size > 0}
        count={selected.size}
        onClear={() => setSelected(new Set())}
        actions={
          <>
            <Button size="sm" variant="secondary">이동</Button>
            <Button size="sm" variant="secondary">복제</Button>
            <Button size="sm" variant="danger">삭제</Button>
          </>
        }
      />
    </ComponentPage>
  );
}
