"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Center, Box } from "@/ds/core";

export default function CenterPage() {
  return (
    <ComponentPage
      name="Center"
      description="콘텐츠를 수평·수직 중앙 정렬하는 컴포넌트."
      importPath='import { Center } from "@junds/ui/core"'
      props={[
        { name: "...", type: "BoxProps", description: "Box의 모든 스타일 props 사용 가능" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <Center h={200} bg="surface-raised" radius="lg" border>
            <Box p={4} bg="primary" radius="md" color="white">
              <span className="text-sm font-medium">가운데 정렬된 콘텐츠</span>
            </Box>
          </Center>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
