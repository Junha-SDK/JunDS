"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { AutoPlayDemo } from "@/ds/composites/AutoPlayDemo";
import { Button } from "@/ds/primitives/Button";
import { Badge } from "@/ds/primitives/Badge";

export default function AutoPlayDemoPage() {
  return (
    <ComponentPage
      name="AutoPlayDemo"
      description="여러 프레임을 자동으로 순환하며 컴포넌트의 다양한 상태를 시연하는 헬퍼. 쇼케이스/문서 전용 도구입니다."
      importPath='import { AutoPlayDemo } from "@/ds/composites/AutoPlayDemo"'
      props={[
        { name: "frames", type: "ReactNode[]", required: true, description: "순환할 프레임 배열" },
        { name: "interval", type: "number", default: "1500", description: "프레임 전환 간격(ms)" },
        { name: "transition", type: '"fade"|"slide-up"|"slide-left"|"scale"|"crossfade"|"none"', default: '"fade"', description: "전환 애니메이션" },
        { name: "duration", type: "number", default: "400", description: "전환 지속 시간(ms)" },
      ]}
    >
      <Section title="Fade" description="기본 페이드 전환.">
        <Preview>
          <div className="w-48 flex items-center justify-center">
            <AutoPlayDemo
              interval={1200}
              frames={[
                <Button key="primary" variant="primary">Primary</Button>,
                <Button key="secondary" variant="secondary">Secondary</Button>,
                <Button key="ghost" variant="ghost">Ghost</Button>,
                <Button key="danger" variant="danger">Danger</Button>,
              ]}
            />
          </div>
        </Preview>
      </Section>

      <Section title="Slide-up">
        <Preview>
          <div className="w-48 flex items-center justify-center">
            <AutoPlayDemo
              transition="slide-up"
              interval={1500}
              frames={[
                <Badge key="a" variant="primary">신규</Badge>,
                <Badge key="b" variant="success">완료</Badge>,
                <Badge key="c" variant="warning">대기</Badge>,
              ]}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
