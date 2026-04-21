"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FloatingActionButton } from "@/ds/composites/FloatingActionButton";

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 4.5h10M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M5 4.5l.5 8.5h5l.5-8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 10a2 2 0 100-4 2 2 0 000 4zM12 6a2 2 0 100-4 2 2 0 000 4zM12 14a2 2 0 100-4 2 2 0 000 4zM5.7 8.7l4.6 2.6M5.7 7.3l4.6-2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function FloatingActionButtonPage() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <ComponentPage
      name="FloatingActionButton"
      description="화면 고정 위치에서 빠른 액션을 제공하는 플로팅 액션 버튼(FAB) 컴포넌트. 여러 액션과 4방향 위치를 지원합니다."
      importPath='import { FloatingActionButton } from "@/ds/composites/FloatingActionButton"'
      props={[
        { name: "actions", type: "FloatingAction[]", required: true, description: "액션 목록 ({ key, icon, label, onClick, variant? })" },
        { name: "position", type: '"bottom-right"|"bottom-left"|"top-right"|"top-left"', default: '"bottom-right"', description: "화면 내 위치" },
      ]}
    >
      <Section title="기본">
        <p className="text-sm text-muted mb-3">
          3개의 액션을 가진 FAB입니다. 첫 번째 액션이 가장 크게 표시되며, hover 시 라벨 툴팁이 나타납니다.
        </p>
        <Preview>
          <div className="relative h-64 bg-gray-50 rounded-lg border border-dashed border-gray-200 overflow-hidden">
            <FloatingActionButton
              actions={[
                { key: "add", icon: <PlusIcon />, label: "추가", onClick: () => setLastAction("추가") },
                { key: "edit", icon: <EditIcon />, label: "편집", onClick: () => setLastAction("편집"), variant: "secondary" },
                { key: "delete", icon: <TrashIcon />, label: "삭제", onClick: () => setLastAction("삭제"), variant: "danger" },
              ]}
              className="!fixed !static absolute"
            />
            {lastAction && (
              <p className="absolute top-4 left-4 text-sm text-foreground">
                마지막 액션: <strong>{lastAction}</strong>
              </p>
            )}
          </div>
        </Preview>
      </Section>

      <Section title="위치">
        <p className="text-sm text-muted mb-3">
          position prop으로 4방향에 FAB를 배치할 수 있습니다. 아래 예시는 relative 컨테이너 안에서 각 위치를 보여줍니다.
        </p>
        <Preview>
          <div className="grid grid-cols-2 gap-4">
            {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((pos) => (
              <div key={pos} className="relative h-40 bg-gray-50 rounded-lg border border-dashed border-gray-200 overflow-hidden">
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted">{pos}</span>
                <FloatingActionButton
                  actions={[
                    { key: "add", icon: <PlusIcon />, label: "추가", onClick: () => {} },
                  ]}
                  position={pos}
                  className="!fixed !static absolute"
                />
              </div>
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="변형">
        <p className="text-sm text-muted mb-3">
          각 액션에 variant prop을 지정하여 primary, secondary, danger 스타일을 적용할 수 있습니다.
        </p>
        <Preview>
          <div className="flex gap-8">
            {(["primary", "secondary", "danger"] as const).map((v) => (
              <div key={v} className="relative h-32 w-32 bg-gray-50 rounded-lg border border-dashed border-gray-200 overflow-hidden">
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted">{v}</span>
                <FloatingActionButton
                  actions={[
                    { key: "action", icon: <ShareIcon />, label: v, onClick: () => {}, variant: v },
                  ]}
                  className="!fixed !static absolute"
                />
              </div>
            ))}
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
