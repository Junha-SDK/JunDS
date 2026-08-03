"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { ResizableFrame } from "../../_components/ResizableFrame";
import { Playground } from "../../_components/Playground";
import { Box, HStack } from "@/ds/core";
import { Switcher, Wrap, SimpleGrid, Spacer, Stack } from "@/ds/layout";
import { Tag } from "@/ds/primitives/Tag";

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <Box p={3} bg="primary" radius="md" color="white" className="text-center">
      <span className="text-sm">{children}</span>
    </Box>
  );
}

export default function LayoutLabPage() {
  return (
    <ComponentPage
      name="Layout Lab"
      description="레이아웃을 의도별로, 폭을 바꿔가며 관찰하는 실험실. 아래 프레임들은 브라우저 창이 아니라 프레임 자신의 폭을 기준으로 동작합니다 — 핸들을 끌거나 프리셋을 눌러 접힘을 직접 확인하세요."
      importPath='import { Switcher, Wrap, SimpleGrid, Stack, Spacer } from "@junds/ui/layout"'
      status="new"
      related={[
        { name: "HStack / VStack", href: "/design-system/framework/stack" },
        { name: "GridLayout", href: "/design-system/framework/grid-layout" },
        { name: "Flex", href: "/design-system/framework/flex" },
      ]}
    >
      <Section
        title="좁으면 세로로 접기 — Switcher"
        description="넓으면 나란히, 좁으면 위아래. 미디어쿼리 없이 자기 컨테이너 폭으로 판단하므로 사이드바·카드 안에 중첩해도 그 자리에 맞게 접힙니다."
      >
        <ResizableFrame
          defaultWidth={720}
          note="threshold(기본 md=768px)보다 프레임이 좁아지는 순간 세로로 접힙니다."
        >
          <Switcher threshold="md" gap="sm">
            <Cell>본문</Cell>
            <Cell>패널</Cell>
            <Cell>메타</Cell>
          </Switcher>
        </ResizableFrame>
      </Section>

      <Section
        title="Switcher — threshold · limit 조절"
        description="threshold는 접힘 기준 폭, limit는 한 줄에 허용할 최대 아이템 수입니다."
      >
        <Playground
          controls={[
            { name: "threshold", type: "select", options: ["sm", "md", "lg"], defaultValue: "sm" },
            { name: "limit", type: "number", defaultValue: 4 },
          ]}
          render={(v) => (
            <Box w="100%" style={{ minWidth: 360 }}>
              <Switcher
                threshold={v.threshold as "sm" | "md" | "lg"}
                limit={Number(v.limit)}
                gap="sm"
              >
                <Cell>A</Cell>
                <Cell>B</Cell>
                <Cell>C</Cell>
              </Switcher>
            </Box>
          )}
          codeTemplate={`<Switcher {threshold} {limit} gap="sm">\n  <Box>A</Box>\n  <Box>B</Box>\n  <Box>C</Box>\n</Switcher>`}
        />
      </Section>

      <Section
        title="넘치면 다음 줄로 — Wrap"
        description="태그·칩처럼 개수가 정해지지 않은 묶음. 프레임이 좁아지면 자연스럽게 줄이 늘어납니다."
      >
        <ResizableFrame defaultWidth={520}>
          <Wrap gap="sm">
            {["디자인 시스템", "레이아웃", "반응형", "토큰", "컴포넌트", "접근성", "다크 모드", "브랜딩"].map(
              (t) => (
                <Tag key={t}>{t}</Tag>
              ),
            )}
          </Wrap>
        </ResizableFrame>
      </Section>

      <Section
        title="격자 — 최소 셀 폭만 주기 (SimpleGrid)"
        description="열 수를 고정하지 않고 minChildWidth만 주면, 열 수가 컨테이너 폭에서 따라 나옵니다."
      >
        <ResizableFrame
          defaultWidth={640}
          note="minChildWidth={160} — 셀이 160px 아래로 눌리는 대신 열 수가 줄어듭니다."
        >
          <SimpleGrid minChildWidth={160} gap="sm">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Cell key={n}>카드 {n}</Cell>
            ))}
          </SimpleGrid>
        </ResizableFrame>
      </Section>

      <Section
        title="양끝으로 밀기 — HStack + Spacer"
        description="제목은 왼쪽, 버튼은 오른쪽. Spacer가 남는 공간을 전부 차지합니다."
      >
        <ResizableFrame defaultWidth={560}>
          <HStack gap="sm">
            <Cell>제목</Cell>
            <Spacer />
            <Cell>버튼</Cell>
          </HStack>
        </ResizableFrame>
      </Section>

      <Section
        title="방향 가변 스택 — Stack"
        description="가로/세로를 값으로 정해야 할 때. 방향이 고정이라면 HStack/VStack이 더 읽기 쉽습니다."
      >
        <Playground
          controls={[
            {
              name: "direction",
              type: "select",
              options: ["row", "column", "row-reverse", "column-reverse"],
              defaultValue: "row",
            },
            { name: "gap", type: "select", options: ["xs", "sm", "md", "lg"], defaultValue: "md" },
          ]}
          render={(v) => (
            <Stack
              direction={v.direction as "row" | "column" | "row-reverse" | "column-reverse"}
              gap={v.gap as "xs" | "sm" | "md" | "lg"}
            >
              <Cell>1</Cell>
              <Cell>2</Cell>
              <Cell>3</Cell>
            </Stack>
          )}
          codeTemplate={`<Stack {direction} {gap}>\n  <Box>1</Box>\n  <Box>2</Box>\n  <Box>3</Box>\n</Stack>`}
        />
      </Section>
    </ComponentPage>
  );
}
