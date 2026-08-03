"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { HStack, VStack, Box } from "@/ds/core";

export default function StackPage() {
  return (
    <ComponentPage
      name="HStack / VStack"
      description="가로(HStack) 및 세로(VStack) 스택 레이아웃. 기본 gap과 정렬이 설정되어 있어 일관된 간격을 보장합니다."
      importPath='import { HStack, VStack } from "@junds/ui/core"'
      props={[
        {
          name: "gap",
          type: "SpacingToken",
          default: 'HStack: "sm", VStack: "md"',
          description: "자식 간 간격",
        },
        {
          name: "align",
          type: '"start"|"center"|"end"|"stretch"',
          default: 'HStack: "center"',
          description: "정렬",
        },
      ]}
    >
      <Section title="HStack (가로 배치)">
        <Preview>
          <HStack gap="md">
            <Box p={3} bg="primary" radius="md" color="white">
              <span className="text-sm">A</span>
            </Box>
            <Box p={3} bg="primary" radius="md" color="white">
              <span className="text-sm">B</span>
            </Box>
            <Box p={3} bg="primary" radius="md" color="white">
              <span className="text-sm">C</span>
            </Box>
          </HStack>
        </Preview>
      </Section>
      <Section title="VStack (세로 배치)">
        <Preview>
          <VStack gap="sm">
            <Box p={3} bg="info" radius="md" color="white" w="100%">
              <span className="text-sm">Row 1</span>
            </Box>
            <Box p={3} bg="info" radius="md" color="white" w="100%">
              <span className="text-sm">Row 2</span>
            </Box>
            <Box p={3} bg="info" radius="md" color="white" w="100%">
              <span className="text-sm">Row 3</span>
            </Box>
          </VStack>
        </Preview>
      </Section>
      <Section title="Gap 비교">
        <Preview>
          <VStack gap="lg">
            {(["xs", "sm", "md", "lg", "xl"] as const).map((g) => (
              <div key={g}>
                <p className="text-[10px] text-muted mb-1 font-mono">gap=&quot;{g}&quot;</p>
                <HStack gap={g}>
                  {[1, 2, 3, 4].map((n) => (
                    <Box key={n} p={2} bg="primary" radius="sm" color="white">
                      <span className="text-[10px]">{n}</span>
                    </Box>
                  ))}
                </HStack>
              </div>
            ))}
          </VStack>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
