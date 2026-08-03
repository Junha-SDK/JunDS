"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Flex, Box } from "@/ds/core";

export default function FlexPage() {
  return (
    <ComponentPage
      name="Flex"
      description="Flexbox 레이아웃 단축 컴포넌트. display='flex'가 자동 적용됩니다."
      importPath='import { Flex } from "@junds/ui/core"'
      props={[
        {
          name: "direction",
          type: '"row"|"column"|"row-reverse"|"column-reverse"',
          default: '"row"',
          description: "flex-direction",
        },
        {
          name: "align",
          type: '"start"|"center"|"end"|"stretch"|"baseline"',
          description: "align-items",
        },
        {
          name: "justify",
          type: '"start"|"center"|"end"|"between"|"around"|"evenly"',
          description: "justify-content",
        },
        { name: "gap", type: "SpacingToken", description: "gap" },
        { name: "wrap", type: '"wrap"|"nowrap"|"wrap-reverse"', description: "flex-wrap" },
        { name: "inline", type: "boolean", description: "inline-flex 사용" },
      ]}
    >
      <Section title="Direction">
        <Preview>
          <div className="space-y-4">
            <Flex gap="sm" align="center">
              {[1, 2, 3].map((n) => (
                <Box key={n} p={3} bg="primary" radius="md" color="white">
                  <span className="text-xs">Item {n}</span>
                </Box>
              ))}
            </Flex>
            <Flex direction="column" gap="sm">
              {[1, 2, 3].map((n) => (
                <Box key={n} p={3} bg="info" radius="md" color="white">
                  <span className="text-xs">Item {n}</span>
                </Box>
              ))}
            </Flex>
          </div>
        </Preview>
      </Section>
      <Section title="Justify & Align">
        <Preview>
          <Flex justify="between" align="center" p={4} bg="surface-raised" radius="lg" border>
            <Box p={2} bg="primary" radius="sm" color="white">
              <span className="text-xs">Left</span>
            </Box>
            <Box p={2} bg="success" radius="sm" color="white">
              <span className="text-xs">Center</span>
            </Box>
            <Box p={2} bg="danger" radius="sm" color="white">
              <span className="text-xs">Right</span>
            </Box>
          </Flex>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
