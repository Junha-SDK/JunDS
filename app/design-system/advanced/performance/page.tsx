"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Badge } from "@/ds/primitives/Badge";

const bundleData = [
  {
    category: "Primitives",
    components: 38,
    estimated: "~45 KB",
    perComponent: "~1.2 KB",
    treeshake: true,
  },
  {
    category: "Composites",
    components: 117,
    estimated: "~180 KB",
    perComponent: "~1.5 KB",
    treeshake: true,
  },
  {
    category: "Patterns",
    components: 24,
    estimated: "~95 KB",
    perComponent: "~4 KB",
    treeshake: true,
  },
  {
    category: "Core Framework",
    components: 15,
    estimated: "~12 KB",
    perComponent: "~0.8 KB",
    treeshake: true,
  },
  {
    category: "Layout",
    components: 11,
    estimated: "~8 KB",
    perComponent: "~0.7 KB",
    treeshake: true,
  },
  {
    category: "Hooks",
    components: 29,
    estimated: "~15 KB",
    perComponent: "~0.5 KB",
    treeshake: true,
  },
];

const topComponents = [
  { name: "DataTable", size: "~18 KB", reason: "25개 기능 내장" },
  { name: "FlowDiagram", size: "~12 KB", reason: "SVG 캔버스 + 인터랙션" },
  { name: "RichTextEditor", size: "~8 KB", reason: "서식 편집기" },
  { name: "Calendar", size: "~6 KB", reason: "날짜 계산 로직" },
  { name: "EmojiPicker", size: "~5 KB", reason: "이모지 데이터셋" },
  { name: "Button", size: "~0.8 KB", reason: "가벼운 primitive" },
  { name: "Badge", size: "~0.5 KB", reason: "순수 스타일" },
  { name: "Box", size: "~0.6 KB", reason: "스타일 해석기" },
];

export default function PerformancePage() {
  return (
    <ComponentPage
      name="Performance"
      description="JunDS의 번들 크기, 트리쉐이킹 지원, 렌더링 성능에 대한 정보입니다."
      importPath="npm run analyze"
      status="stable"
    >
      <Section
        title="번들 크기 요약"
        description="모든 수치는 gzip 압축 후 추정치입니다. 개별 import 시 사용하지 않는 컴포넌트는 번들에 포함되지 않습니다."
      >
        <Preview padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                    카테고리
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                    컴포넌트 수
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                    전체 크기
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                    컴포넌트당
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                    Tree-shake
                  </th>
                </tr>
              </thead>
              <tbody>
                {bundleData.map((row) => (
                  <tr key={row.category} className="border-b border-border-light">
                    <td className="px-4 py-3 font-medium">{row.category}</td>
                    <td className="px-4 py-3 tabular-nums">{row.components}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.estimated}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.perComponent}</td>
                    <td className="px-4 py-3">
                      <Badge variant="success" size="sm">
                        지원
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Preview>
      </Section>

      <Section
        title="컴포넌트별 크기 (Top 8)"
        description="가장 큰 컴포넌트와 가장 가벼운 컴포넌트입니다."
      >
        <Preview>
          <div className="space-y-2">
            {topComponents.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-sm font-semibold w-36 shrink-0">{c.name}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(100, parseFloat(c.size) / 0.18)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted w-16 text-right shrink-0">
                  {c.size}
                </span>
                <span className="text-xs text-muted shrink-0 hidden md:block">{c.reason}</span>
              </div>
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="최적화 팁">
        <Preview>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border">
              <h4 className="text-sm font-bold text-success mb-2">Do: 개별 import</h4>
              <pre className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded-lg">
                {`import { Button } from "@junds/ui/primitives/Button";
// 번들: ~0.8 KB`}
              </pre>
            </div>
            <div className="p-4 rounded-xl border border-border">
              <h4 className="text-sm font-bold text-danger mb-2">Avoid: 전체 import</h4>
              <pre className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded-lg">
                {`import { Button } from "@junds/ui";
// Tree-shake 되지만 분석이 어려움`}
              </pre>
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
