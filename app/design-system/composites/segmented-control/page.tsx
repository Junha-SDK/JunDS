"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SegmentedControl } from "@/ds/composites/SegmentedControl";

export default function SegmentedControlPage() {
  const [view, setView] = useState("list");
  const [size, setSize] = useState("md");
  const [tab, setTab] = useState("all");

  return (
    <ComponentPage
      name="SegmentedControl"
      description="iOS 스타일의 세그먼트 선택기. 다양한 크기와 전체 너비 모드를 지원합니다."
      importPath='import { SegmentedControl } from "@/ds/composites/SegmentedControl"'
      props={[
        { name: "options", type: "SegmentOption[]", required: true, description: "선택지 목록" },
        { name: "value", type: "string", required: true, description: "현재 선택된 값" },
        { name: "onChange", type: "(value: string) => void", required: true, description: "값 변경 콜백" },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "크기" },
        { name: "fullWidth", type: "boolean", default: "false", description: "전체 너비 사용" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <SegmentedControl
            options={[
              { key: "list", label: "목록" },
              { key: "grid", label: "그리드" },
              { key: "kanban", label: "칸반" },
            ]}
            value={view}
            onChange={setView}
          />
          <p className="mt-3 text-sm text-muted">선택: {view}</p>
        </Preview>
      </Section>

      <Section title="크기 비교">
        <Preview>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-muted mb-2">Small</p>
              <SegmentedControl
                size="sm"
                options={[
                  { key: "sm-a", label: "옵션 A" },
                  { key: "sm-b", label: "옵션 B" },
                ]}
                value={size === "sm" ? "sm-a" : "sm-b"}
                onChange={() => setSize("sm")}
              />
            </div>
            <div>
              <p className="text-xs text-muted mb-2">Medium (기본)</p>
              <SegmentedControl
                size="md"
                options={[
                  { key: "md-a", label: "옵션 A" },
                  { key: "md-b", label: "옵션 B" },
                ]}
                value={size === "md" ? "md-a" : "md-b"}
                onChange={() => setSize("md")}
              />
            </div>
            <div>
              <p className="text-xs text-muted mb-2">Large</p>
              <SegmentedControl
                size="lg"
                options={[
                  { key: "lg-a", label: "옵션 A" },
                  { key: "lg-b", label: "옵션 B" },
                ]}
                value={size === "lg" ? "lg-a" : "lg-b"}
                onChange={() => setSize("lg")}
              />
            </div>
          </div>
        </Preview>
      </Section>

      <Section title="전체 너비">
        <Preview>
          <SegmentedControl
            fullWidth
            options={[
              { key: "all", label: "전체" },
              { key: "active", label: "활성" },
              { key: "inactive", label: "비활성" },
            ]}
            value={tab}
            onChange={setTab}
          />
        </Preview>
      </Section>

      <Section title="비활성 옵션">
        <Preview>
          <SegmentedControl
            options={[
              { key: "free", label: "무료" },
              { key: "pro", label: "프로" },
              { key: "enterprise", label: "엔터프라이즈", disabled: true },
            ]}
            value="free"
            onChange={() => {}}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
