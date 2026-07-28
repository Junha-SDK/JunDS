"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Group, Box } from "@/ds/core";
import { Button } from "@/ds/primitives/Button";

export default function GroupPage() {
  return (
    <ComponentPage
      name="Group"
      description="가로 방향 그룹. 버튼 그룹, 태그 목록 등에 사용합니다. 기본적으로 wrap이 허용되며 중앙 정렬됩니다."
      importPath='import { Group } from "@junds/ui/core"'
      props={[
        { name: "gap", type: "SpacingToken", default: '"sm"', description: "아이템 간격" },
        { name: "noWrap", type: "boolean", description: "줄 바꿈 방지" },
      ]}
    >
      <Section title="버튼 그룹">
        <Preview>
          <Group gap="sm">
            <Button variant="primary" size="sm">
              저장
            </Button>
            <Button variant="secondary" size="sm">
              취소
            </Button>
            <Button variant="ghost" size="sm">
              초기화
            </Button>
          </Group>
        </Preview>
      </Section>
      <Section title="Gap 변형">
        <Preview>
          <div className="space-y-3">
            {(["xs", "sm", "md", "lg"] as const).map((g) => (
              <div key={g}>
                <p className="text-[10px] text-muted mb-1 font-mono">gap=&quot;{g}&quot;</p>
                <Group gap={g}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Box key={n} px={3} py={1} bg="primary" radius="full" color="white">
                      <span className="text-xs">Tag {n}</span>
                    </Box>
                  ))}
                </Group>
              </div>
            ))}
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
