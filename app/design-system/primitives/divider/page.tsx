"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Divider } from "@/ds/primitives/Divider";

export default function DividerPage() {
  return (
    <ComponentPage
      name="Divider"
      description="콘텐츠 구분선. 라벨 포함 가능."
      importPath='import { Divider } from "@/ds/primitives/Divider"'
      props={[
        {
          name: "orientation",
          type: '"horizontal"|"vertical"',
          default: '"horizontal"',
          description: "방향",
        },
        { name: "label", type: "string", description: "구분선 위 라벨" },
      ]}
    >
      <Section title="Variants">
        <Preview>
          <div className="flex flex-col gap-6 max-w-md">
            <div>
              <p className="text-sm text-muted mb-2">기본</p>
              <Divider />
            </div>
            <div>
              <p className="text-sm text-muted mb-2">라벨 포함</p>
              <Divider label="또는" />
            </div>
            <div className="flex items-center gap-3 h-8">
              <span className="text-sm">왼쪽</span>
              <Divider orientation="vertical" />
              <span className="text-sm">오른쪽</span>
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
