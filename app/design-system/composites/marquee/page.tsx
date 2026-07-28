"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Marquee } from "@/ds/composites/Marquee";
import { Badge } from "@/ds/primitives/Badge";

const tags = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind",
  "Design System",
  "Accessibility",
  "Storybook",
];

export default function MarqueePage() {
  return (
    <ComponentPage
      name="Marquee"
      description="콘텐츠를 무한 가로 스크롤로 흘려보내는 컴포넌트입니다. 로고 띠, 태그 띠 등에 사용합니다."
      importPath='import { Marquee } from "@/ds/composites/Marquee"'
      props={[
        { name: "speed", type: "number", default: "30", description: "한 바퀴 도는 시간(초)" },
        { name: "direction", type: '"left"|"right"', default: '"left"', description: "흐름 방향" },
        {
          name: "pauseOnHover",
          type: "boolean",
          default: "true",
          description: "호버 시 일시 정지",
        },
        { name: "gap", type: "number", default: "48", description: "아이템 간 간격(px)" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full max-w-2xl">
            <Marquee>
              {tags.map((t) => (
                <Badge key={t} variant="primary">
                  {t}
                </Badge>
              ))}
            </Marquee>
          </div>
        </Preview>
      </Section>

      <Section title="역방향 + 빠른 속도">
        <Preview>
          <div className="w-full max-w-2xl">
            <Marquee direction="right" speed={15}>
              {tags.map((t) => (
                <Badge key={t} variant="default">
                  {t}
                </Badge>
              ))}
            </Marquee>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
