"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Resizable } from "@/ds/composites/Resizable";

export default function ResizablePage() {
  return (
    <ComponentPage
      name="Resizable"
      description="리사이저블 패널. 드래그 핸들로 두 패널의 크기를 조절할 수 있습니다. 수평/수직 분할을 지원합니다."
      importPath='import { Resizable } from "@/ds/composites/Resizable"'
      props={[
        { name: "children", type: "[ReactNode, ReactNode]", required: true, description: "두 개의 패널 (튜플)" },
        { name: "direction", type: '"horizontal"|"vertical"', default: '"horizontal"', description: "분할 방향" },
        { name: "defaultSize", type: "number", default: "50", description: "첫 번째 패널 기본 크기 (%)" },
        { name: "minSize", type: "number", default: "10", description: "최소 크기 (%)" },
        { name: "maxSize", type: "number", default: "90", description: "최대 크기 (%)" },
      ]}
    >
      <Section title="수평 분할">
        <Preview>
          <Resizable direction="horizontal" defaultSize={40}>
            <div className="h-48 p-4 bg-blue-50 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-blue-700">왼쪽 패널</p>
                <p className="text-xs text-blue-500 mt-1">드래그하여 크기 조절</p>
              </div>
            </div>
            <div className="h-48 p-4 bg-emerald-50 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-emerald-700">오른쪽 패널</p>
                <p className="text-xs text-emerald-500 mt-1">나머지 공간을 차지합니다</p>
              </div>
            </div>
          </Resizable>
        </Preview>
      </Section>

      <Section title="수직 분할">
        <Preview>
          <Resizable direction="vertical" defaultSize={40}>
            <div className="h-full min-h-[80px] p-4 bg-amber-50 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-amber-700">상단 패널</p>
                <p className="text-xs text-amber-500 mt-1">드래그하여 크기 조절</p>
              </div>
            </div>
            <div className="h-full min-h-[80px] p-4 bg-violet-50 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-violet-700">하단 패널</p>
              </div>
            </div>
          </Resizable>
        </Preview>
      </Section>

      <Section title="코드 에디터 레이아웃">
        <Preview>
          <Resizable direction="horizontal" defaultSize={25} minSize={15} maxSize={50}>
            <div className="h-64 p-3 bg-gray-900 text-gray-300 overflow-auto">
              <p className="text-xs font-mono font-bold text-gray-400 mb-2">탐색기</p>
              {["src/", "  components/", "    Button.tsx", "    Card.tsx", "  pages/", "    index.tsx", "  utils/", "    cn.ts", "package.json", "tsconfig.json"].map((f) => (
                <p key={f} className="text-xs font-mono py-0.5 hover:bg-gray-800 px-1 rounded cursor-pointer">
                  {f}
                </p>
              ))}
            </div>
            <div className="h-64 p-4 bg-gray-950 text-gray-300 font-mono text-xs overflow-auto">
              <p className="text-gray-500">{"// Button.tsx"}</p>
              <p><span className="text-purple-400">export function</span> <span className="text-yellow-300">Button</span>() {"{"}</p>
              <p>  <span className="text-purple-400">return</span> {"<"}button{">"}Click{"<"}/button{">"}</p>
              <p>{"}"}</p>
            </div>
          </Resizable>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
