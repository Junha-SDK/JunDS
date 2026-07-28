"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PullToRefresh } from "@/ds/composites/PullToRefresh";

export default function PullToRefreshPage() {
  const [items, setItems] = useState(() =>
    Array.from({ length: 10 }, (_, i) => `아이템 #${i + 1}`),
  );

  const refresh = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    setItems((prev) => [`새 아이템 (${new Date().toLocaleTimeString()})`, ...prev]);
  };

  return (
    <ComponentPage
      name="PullToRefresh"
      description="모바일에서 위로 당기면 새로고침이 트리거되는 컨테이너입니다. 터치 환경에서 동작합니다."
      importPath='import { PullToRefresh } from "@/ds/composites/PullToRefresh"'
      props={[
        {
          name: "onRefresh",
          type: "() => Promise<void>",
          description: "당김 임계값을 넘었을 때 실행할 비동기 함수",
        },
        {
          name: "threshold",
          type: "number",
          default: "60",
          description: "새로고침 트리거 거리(px)",
        },
        { name: "children", type: "ReactNode", description: "스크롤 가능한 자식" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full max-w-sm">
            <PullToRefresh
              onRefresh={refresh}
              className="h-72 rounded-xl border border-border bg-white"
            >
              <ul className="divide-y divide-border">
                {items.map((it) => (
                  <li key={it} className="px-4 py-3 text-sm">
                    {it}
                  </li>
                ))}
              </ul>
            </PullToRefresh>
            <p className="text-xs text-muted mt-2">모바일/터치 환경에서 위로 당겨보세요.</p>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
