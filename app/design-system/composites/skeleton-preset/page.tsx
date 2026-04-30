"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SkeletonPreset } from "@/ds/composites/SkeletonPreset";

export default function SkeletonPresetPage() {
  return (
    <ComponentPage
      name="SkeletonPreset"
      description="자주 쓰이는 로딩 상태 골격을 미리 만들어 둔 프리셋 컴포넌트. card, table, profile, article, list 5종을 제공합니다."
      importPath='import { SkeletonPreset } from "@/ds/composites/SkeletonPreset"'
      props={[
        { name: "variant", type: '"card" | "table" | "profile" | "article" | "list"', required: true, description: "골격 형태" },
        { name: "rows", type: "number", default: "5", description: "table / list 변형의 행 수" },
        { name: "className", type: "string", description: "추가 클래스" },
      ]}
    >
      <Section title="Card">
        <Preview>
          <div className="w-full max-w-sm">
            <SkeletonPreset variant="card" />
          </div>
        </Preview>
      </Section>

      <Section title="Table">
        <Preview>
          <div className="w-full max-w-xl">
            <SkeletonPreset variant="table" rows={4} />
          </div>
        </Preview>
      </Section>

      <Section title="Profile / List / Article">
        <Preview>
          <div className="flex flex-col gap-6 w-full max-w-md">
            <SkeletonPreset variant="profile" />
            <SkeletonPreset variant="list" rows={3} />
            <SkeletonPreset variant="article" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
