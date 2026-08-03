"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { GridLayout, Box } from "@/ds/core";

export default function GridLayoutPage() {
  return (
    <ComponentPage
      name="GridLayout"
      description="CSS Grid 기반 레이아웃. cols와 gap을 토큰으로 제어합니다."
      importPath='import { GridLayout } from "@junds/ui/core"'
      props={[
        {
          name: "cols",
          type: "number | string",
          default: "1",
          description: "컬럼 수 (숫자) 또는 grid-template-columns (문자열)",
        },
        { name: "rows", type: "number | string", description: "행 수" },
        { name: "gap", type: "SpacingToken", default: '"md"', description: "그리드 간격" },
      ]}
    >
      <Section title="Columns">
        <Preview>
          <div className="space-y-4">
            {[2, 3, 4].map((n) => (
              <div key={n}>
                <p className="text-[10px] text-muted mb-1 font-mono">cols={`{${n}}`}</p>
                <GridLayout cols={n} gap="sm">
                  {Array.from({ length: n * 2 }, (_, i) => (
                    <Box key={i} p={3} bg="primary" radius="md" color="white" textAlign="center">
                      <span className="text-xs">{i + 1}</span>
                    </Box>
                  ))}
                </GridLayout>
              </div>
            ))}
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
