"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { MasonryGrid } from "@/ds/patterns/MasonryGrid";

const COLORS = [
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
  "from-blue-400 to-indigo-500",
  "from-cyan-400 to-teal-500",
  "from-emerald-400 to-green-500",
  "from-amber-400 to-orange-500",
  "from-red-400 to-rose-500",
  "from-fuchsia-400 to-pink-500",
  "from-sky-400 to-blue-500",
  "from-lime-400 to-emerald-500",
  "from-yellow-400 to-amber-500",
  "from-indigo-400 to-violet-500",
];

const HEIGHTS = [120, 180, 140, 200, 160, 220, 130, 190, 150, 170, 210, 140];

function Card({ index, height }: { index: number; height: number }) {
  return (
    <div
      className={`rounded-xl bg-gradient-to-br ${COLORS[index % COLORS.length]} p-4 flex flex-col justify-between text-white shadow-md`}
      style={{ height }}
    >
      <span className="text-xs font-medium opacity-70">Card {index + 1}</span>
      <span className="text-lg font-bold">{height}px</span>
    </div>
  );
}

export default function MasonryGridPage() {
  return (
    <ComponentPage
      name="MasonryGrid"
      description="CSS columns 기반의 메이슨리 레이아웃. 다양한 높이의 아이템을 자연스럽게 배치합니다."
      importPath='import { MasonryGrid } from "@/ds/patterns/MasonryGrid"'
      props={[
        { name: "children", type: "ReactNode", description: "그리드 아이템들" },
        { name: "columns", type: "2 | 3 | 4", default: "3", description: "컬럼 수" },
        { name: "gap", type: "number", default: "16", description: "아이템 간격 (px)" },
        { name: "className", type: "string", description: "추가 CSS 클래스" },
      ]}
    >
      <Section title="기본">
        <Preview>
          <MasonryGrid columns={3} gap={12}>
            {HEIGHTS.map((h, i) => (
              <Card key={i} index={i} height={h} />
            ))}
          </MasonryGrid>
        </Preview>
      </Section>

      <Section title="컬럼 비교">
        <Preview>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">2 Columns</p>
              <MasonryGrid columns={2} gap={10}>
                {HEIGHTS.slice(0, 6).map((h, i) => (
                  <Card key={i} index={i} height={h} />
                ))}
              </MasonryGrid>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">3 Columns</p>
              <MasonryGrid columns={3} gap={10}>
                {HEIGHTS.slice(0, 9).map((h, i) => (
                  <Card key={i} index={i + 2} height={h} />
                ))}
              </MasonryGrid>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">4 Columns</p>
              <MasonryGrid columns={4} gap={10}>
                {HEIGHTS.map((h, i) => (
                  <Card key={i} index={i + 4} height={h} />
                ))}
              </MasonryGrid>
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
