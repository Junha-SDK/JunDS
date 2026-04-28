"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Box } from "@/ds/core";

export default function BoxPage() {
  return (
    <ComponentPage
      name="Box"
      description="모든 레이아웃의 기반. raw <div> 대신 사용하여 토큰 기반 스타일링을 강제합니다."
      importPath='import { Box } from "@junds/ui/core"'
      props={[
        { name: "as", type: "ElementType", default: '"div"', description: "렌더링할 HTML 태그" },
        { name: "p / px / py / pt / pr / pb / pl", type: "SpacingToken", description: "패딩 (토큰)" },
        { name: "m / mx / my / mt / mr / mb / ml", type: "SpacingToken", description: "마진 (토큰)" },
        { name: "gap", type: "SpacingToken", description: "gap (토큰)" },
        { name: "bg", type: "ColorToken", description: "배경색 (토큰)" },
        { name: "color", type: "ColorToken", description: "텍스트색 (토큰)" },
        { name: "radius", type: "RadiusToken", description: "border-radius" },
        { name: "shadow", type: "ShadowToken", description: "box-shadow" },
        { name: "border", type: "boolean", description: "테두리 표시" },
        { name: "display", type: '"flex"|"grid"|"block"|...', description: "display 속성" },
        { name: "w / h", type: "string|number", description: "너비/높이" },
      ]}
    >
      <Section title="Spacing">
        <Preview>
          <div className="flex gap-3 flex-wrap">
            {([1, 2, 4, 6, 8] as const).map((n) => (
              <Box key={n} p={n} bg="primary" radius="md" color="white">
                <span className="text-xs font-mono">p={`{${n}}`}</span>
              </Box>
            ))}
          </div>
        </Preview>
      </Section>
      <Section title="Colors & Radius">
        <Preview>
          <div className="flex gap-3 flex-wrap">
            {(["primary", "success", "warning", "danger", "info"] as const).map((c) => (
              <Box key={c} p={4} bg={c} radius="lg" color="white">
                <span className="text-xs font-medium">{c}</span>
              </Box>
            ))}
          </div>
        </Preview>
      </Section>
      <Section title="Shadow & Border">
        <Preview>
          <div className="flex gap-4 flex-wrap">
            {(["sm", "md", "lg", "xl"] as const).map((s) => (
              <Box key={s} p={4} bg="white" radius="lg" shadow={s}>
                <span className="text-xs font-mono">shadow=&quot;{s}&quot;</span>
              </Box>
            ))}
            <Box p={4} bg="white" radius="lg" border>
              <span className="text-xs font-mono">border</span>
            </Box>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
