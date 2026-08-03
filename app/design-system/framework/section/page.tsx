"use client";
import { ComponentPage, Section as DocSection } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Section, Box, VStack } from "@/ds/core";

export default function SectionPage() {
  return (
    <ComponentPage
      name="Section"
      description="콘텐츠 영역 구분. title, description, gap을 제공하여 일관된 섹션 구조를 강제합니다."
      importPath='import { Section } from "@junds/ui/core"'
      props={[
        { name: "title", type: "string", description: "섹션 제목" },
        { name: "description", type: "string", description: "섹션 설명" },
        { name: "gap", type: "SpacingToken", default: '"md"', description: "자식 간 간격" },
        { name: "p", type: "SpacingToken", description: "내부 패딩" },
        { name: "border", type: "boolean", description: "테두리 표시" },
      ]}
    >
      <DocSection title="기본 사용">
        <Preview>
          <VStack gap="lg">
            <Section title="최근 활동" description="지난 7일간의 활동입니다">
              <Box p={3} bg="surface-raised" radius="md" border>
                <span className="text-sm">활동 1</span>
              </Box>
              <Box p={3} bg="surface-raised" radius="md" border>
                <span className="text-sm">활동 2</span>
              </Box>
            </Section>
            <Section title="통계" border p={4}>
              <Box p={3} bg="primary" radius="md" color="white">
                <span className="text-sm">테두리 있는 섹션</span>
              </Box>
            </Section>
          </VStack>
        </Preview>
      </DocSection>
    </ComponentPage>
  );
}
