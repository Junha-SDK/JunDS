"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Dock } from "@/ds/composites/Dock";

export default function DockPage() {
  return (
    <ComponentPage
      name="Dock"
      description="macOS 스타일의 도크 바. 마우스 위치에 따라 아이템이 확대되는 인터랙션을 제공합니다."
      importPath='import { Dock } from "@/ds/composites/Dock"'
      props={[
        {
          name: "magnification",
          type: "number",
          default: "1.6",
          description: "마우스 호버 시 최대 확대 배율",
        },
        { name: "children", type: "ReactNode", description: "Dock.Item 요소들" },
        { name: "className", type: "string", description: "도크 컨테이너 클래스" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="flex justify-center w-full py-6">
            <Dock>
              <Dock.Item label="홈">
                <span className="text-xl">🏠</span>
              </Dock.Item>
              <Dock.Item label="검색">
                <span className="text-xl">🔍</span>
              </Dock.Item>
              <Dock.Item label="메시지">
                <span className="text-xl">💬</span>
              </Dock.Item>
              <Dock.Item label="설정">
                <span className="text-xl">⚙️</span>
              </Dock.Item>
              <Dock.Item label="알림">
                <span className="text-xl">🔔</span>
              </Dock.Item>
            </Dock>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
