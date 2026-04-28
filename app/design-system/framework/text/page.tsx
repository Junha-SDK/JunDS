"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Text, VStack } from "@/ds/core";

export default function TextPage() {
  return (
    <ComponentPage
      name="Text"
      description="프레임워크가 강제하는 본문 텍스트. raw <p>, <span> 대신 사용하여 일관된 크기·무게·색상을 보장합니다."
      importPath='import { Text } from "@junds/ui/core"'
      props={[
        { name: "as", type: '"p"|"span"|"div"|"label"|"strong"|"em"|"small"', default: '"p"', description: "렌더링 태그" },
        { name: "fontSize", type: "FontSizeToken", default: '"md"', description: "글자 크기" },
        { name: "fontWeight", type: "FontWeightToken", description: "글자 무게" },
        { name: "color", type: "ColorToken", description: "텍스트 색상" },
        { name: "dimmed", type: "boolean", description: "흐린 텍스트 (muted)" },
        { name: "mono", type: "boolean", description: "모노스페이스 폰트" },
        { name: "truncate", type: "boolean", description: "말줄임" },
        { name: "lineClamp", type: "number", description: "최대 줄 수 제한" },
      ]}
    >
      <Section title="Size 스케일">
        <Preview>
          <VStack gap="xs">
            {(["xs","sm","md","lg","xl","2xl"] as const).map(s => (
              <Text key={s} fontSize={s}>Text fontSize=&quot;{s}&quot; — 디자인 시스템이 크기를 결정합니다</Text>
            ))}
          </VStack>
        </Preview>
      </Section>
      <Section title="Weight & Color">
        <Preview>
          <VStack gap="xs">
            <Text fontWeight="normal">Normal weight</Text>
            <Text fontWeight="medium">Medium weight</Text>
            <Text fontWeight="semibold">Semibold weight</Text>
            <Text fontWeight="bold">Bold weight</Text>
            <Text color="primary">Primary 색상</Text>
            <Text dimmed>Dimmed (muted) 텍스트</Text>
            <Text mono>Monospace 코드 텍스트</Text>
          </VStack>
        </Preview>
      </Section>
      <Section title="Line Clamp">
        <Preview>
          <div className="max-w-sm">
            <Text lineClamp={2}>
              이 텍스트는 최대 2줄까지만 표시됩니다. 프레임워크가 말줄임을 자동으로 처리합니다. 더 긴 텍스트는 잘리고 ...으로 표시됩니다. 이렇게 길게 쓰면 2줄을 넘기게 됩니다.
            </Text>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
