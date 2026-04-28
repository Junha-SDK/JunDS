"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";

export default function ProviderPage() {
  return (
    <ComponentPage
      name="JunDSProvider"
      description="JunDS 프레임워크의 필수 프로바이더. 테마, 밀도, 반경, 간격을 전역으로 제어합니다. 앱의 루트를 반드시 감싸야 합니다."
      importPath='import { JunDSProvider } from "@junds/ui/core"'
      props={[
        { name: "theme", type: "string", default: '"purple"', description: "테마 이름 또는 primary 색상 hex" },
        { name: "colorMode", type: '"light"|"dark"|"system"', default: '"system"', description: "색상 모드" },
        { name: "density", type: '"compact"|"normal"|"comfortable"', default: '"normal"', description: "전역 UI 밀도" },
        { name: "radius", type: '"none"|"sm"|"md"|"lg"|"full"', default: '"md"', description: "전역 border-radius 프리셋" },
        { name: "spacing", type: '"tight"|"default"|"relaxed"', default: '"default"', description: "전역 간격 배율" },
        { name: "locale", type: "string", default: '"ko"', description: "언어 설정" },
      ]}
    >
      <Section title="기본 사용법">
        <Preview>
          <div className="p-4 bg-gray-50 rounded-xl text-sm font-mono space-y-1">
            <p className="text-muted">{"// app/layout.tsx"}</p>
            <p>{"<JunDSProvider"}</p>
            <p className="pl-4 text-primary">{'theme="purple"'}</p>
            <p className="pl-4 text-primary">{'colorMode="system"'}</p>
            <p className="pl-4 text-primary">{'density="normal"'}</p>
            <p className="pl-4 text-primary">{'radius="md"'}</p>
            <p>{">"}</p>
            <p className="pl-4">{"<App />"}</p>
            <p>{"</JunDSProvider>"}</p>
          </div>
        </Preview>
      </Section>
      <Section title="프로바이더가 제어하는 것">
        <Preview>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 border border-border rounded-lg">
              <p className="font-semibold text-foreground mb-1">theme</p>
              <p className="text-muted text-xs">18개 프리셋 + 커스텀 색상. 모든 컴포넌트의 primary 색상 결정.</p>
            </div>
            <div className="p-3 border border-border rounded-lg">
              <p className="font-semibold text-foreground mb-1">density</p>
              <p className="text-muted text-xs">compact/normal/comfortable. 패딩·폰트 크기를 전역 제어.</p>
            </div>
            <div className="p-3 border border-border rounded-lg">
              <p className="font-semibold text-foreground mb-1">radius</p>
              <p className="text-muted text-xs">none~full. 모든 컴포넌트의 border-radius 스케일 결정.</p>
            </div>
            <div className="p-3 border border-border rounded-lg">
              <p className="font-semibold text-foreground mb-1">spacing</p>
              <p className="text-muted text-xs">tight/default/relaxed. 전역 간격 배율 제어.</p>
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
