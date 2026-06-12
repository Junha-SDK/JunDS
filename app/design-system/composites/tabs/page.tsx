"use client";
import { useState } from "react";
import { ComponentPage, Section, Guidelines, Anatomy, UsageNote, AccessibilityNote, CodeExample, VariantGrid, VariantItem } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Tabs } from "@/ds/composites/Tabs";

const demoTabs = [
  { value: "all", label: "전체", badge: 42 },
  { value: "mine", label: "내 업무", badge: 8 },
  { value: "review", label: "검토 중", badge: 3 },
  { value: "done", label: "완료" },
];

const simpleTabs = [
  { value: "overview", label: "개요" },
  { value: "spec", label: "스펙" },
  { value: "review", label: "리뷰" },
];

export default function TabsPage() {
  const [v, setV] = useState("all");
  const [simple, setSimple] = useState("overview");

  return (
    <ComponentPage
      name="Tabs"
      description="관련된 콘텐츠를 탭으로 구분하여 같은 영역 안에서 전환할 수 있게 해주는 네비게이션 컴포넌트입니다. underline, pills, segment 3가지 시각 변형을 제공하며, 뱃지와 아이콘도 지원합니다."
      importPath='import { Tabs } from "@/ds/composites/Tabs"'
      status="stable"
      version="1.0.0"
      props={[
        { name: "tabs", type: "Tab[]", required: true, description: "탭 항목 배열입니다. 각 항목은 value, label, icon?, badge?, disabled?를 가집니다." },
        { name: "value", type: "string", required: true, description: "현재 활성화된 탭의 value입니다." },
        { name: "onChange", type: "(value: string) => void", required: true, description: "탭 선택이 변경될 때 호출되는 콜백입니다." },
        { name: "variant", type: '"underline" | "pills" | "segment"', default: '"underline"', description: "탭의 시각적 스타일입니다." },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "탭의 크기입니다. 밀도가 높은 UI에서는 sm을 사용하세요." },
        { name: "className", type: "string", description: "탭 컨테이너에 추가할 커스텀 클래스입니다." },
      ]}
      related={[
        { name: "SegmentedControl", href: "/design-system/composites/segmented-control" },
        { name: "Accordion", href: "/design-system/composites/accordion" },
        { name: "NavigationMenu", href: "/design-system/composites/navigation-menu" },
      ]}
    >
      {/* ── Overview ── */}
      <Section title="Overview" description="탭을 사용하면 한 화면에서 여러 카테고리의 콘텐츠를 페이지 전환 없이 빠르게 탐색할 수 있습니다.">
        <Preview
          sourceCode={`const [tab, setTab] = useState("overview");
const tabs = [
  { value: "overview", label: "개요" },
  { value: "spec", label: "스펙" },
  { value: "review", label: "리뷰" },
];

<Tabs tabs={tabs} value={tab} onChange={setTab} />`}
        >
          <Tabs tabs={simpleTabs} value={simple} onChange={setSimple} />
        </Preview>
      </Section>

      {/* ── Anatomy ── */}
      <Section title="Anatomy" description="Tabs 컴포넌트의 내부 구조입니다.">
        <Anatomy
          items={[
            { label: "Tab List", description: "탭 버튼들을 감싸는 컨테이너입니다. role='tablist'가 적용되어 스크린 리더가 탭 그룹으로 인식합니다." },
            { label: "Tab Trigger", description: "개별 탭 버튼입니다. role='tab'과 aria-selected가 자동 적용됩니다. 클릭하면 해당 패널이 활성화됩니다." },
            { label: "Tab Panel", description: "선택된 탭에 대응하는 콘텐츠 영역입니다. 현재 Tabs 컴포넌트는 탭 목록만 제공하며, 패널은 value 상태에 따라 직접 조건부 렌더링합니다." },
          ]}
        />
      </Section>

      {/* ── Variants ── */}
      <Section title="Variants" description="3가지 시각 변형으로 다양한 맥락에 맞는 탭 UI를 구성할 수 있습니다.">
        <VariantGrid cols={1}>
          <VariantItem
            label="Underline"
            description="기본 스타일. 하단 border로 활성 탭을 표시합니다. 페이지 상단 네비게이션에 적합합니다."
            sourceCode={`<Tabs tabs={tabs} value={v} onChange={setV} variant="underline" />`}
          >
            <Tabs tabs={demoTabs} value={v} onChange={setV} variant="underline" />
          </VariantItem>
        </VariantGrid>
        <div className="mt-4">
          <VariantGrid cols={1}>
            <VariantItem
              label="Pills"
              description="둥근 pill 형태로 활성 탭을 강조합니다. 필터링 UI에 적합합니다."
              sourceCode={`<Tabs tabs={tabs} value={v} onChange={setV} variant="pills" />`}
            >
              <Tabs tabs={demoTabs} value={v} onChange={setV} variant="pills" />
            </VariantItem>
          </VariantGrid>
        </div>
        <div className="mt-4">
          <VariantGrid cols={1}>
            <VariantItem
              label="Segment"
              description="SegmentedControl 스타일입니다. 토글 형태의 선택 UI에 적합합니다."
              sourceCode={`<Tabs tabs={tabs} value={v} onChange={setV} variant="segment" />`}
            >
              <Tabs tabs={demoTabs} value={v} onChange={setV} variant="segment" />
            </VariantItem>
          </VariantGrid>
        </div>
      </Section>

      {/* ── Sizes ── */}
      <Section title="Sizes" description="2가지 크기를 제공합니다.">
        <VariantGrid cols={2}>
          <VariantItem
            label="Small (sm)"
            description="밀도가 높은 UI, 카드 내부 등에 적합합니다."
            sourceCode={`<Tabs tabs={tabs} value={v} onChange={setV} size="sm" />`}
          >
            <Tabs tabs={simpleTabs} value={simple} onChange={setSimple} variant="underline" size="sm" />
          </VariantItem>
          <VariantItem
            label="Medium (md)"
            description="기본 크기입니다. 페이지 레벨 탭에 적합합니다."
            sourceCode={`<Tabs tabs={tabs} value={v} onChange={setV} size="md" />`}
          >
            <Tabs tabs={simpleTabs} value={simple} onChange={setSimple} variant="underline" size="md" />
          </VariantItem>
        </VariantGrid>
      </Section>

      {/* ── Features ── */}
      <Section title="주요 기능" description="Tabs가 기본 제공하는 인터랙션과 표시 기능입니다.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold text-foreground mb-1">키보드 내비게이션</h4>
            <p className="text-xs text-muted leading-relaxed">
              탭에 포커스된 상태에서 클릭으로 탭을 전환할 수 있습니다.
              각 탭 버튼은 <code className="text-xs bg-gray-100 px-1 rounded">active:scale-95</code> 피드백을 제공합니다.
            </p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold text-foreground mb-1">뱃지 지원</h4>
            <p className="text-xs text-muted leading-relaxed">
              각 탭에 숫자 뱃지를 표시할 수 있습니다. 읽지 않은 항목 수, 필터 결과 개수 등을 시각적으로 안내합니다.
            </p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold text-foreground mb-1">아이콘 지원</h4>
            <p className="text-xs text-muted leading-relaxed">
              각 탭에 아이콘을 추가할 수 있습니다. label 앞에 렌더링되어 시각적 구분을 강화합니다.
            </p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold text-foreground mb-1">비활성화 탭</h4>
            <p className="text-xs text-muted leading-relaxed">
              개별 탭을 <code className="text-xs bg-gray-100 px-1 rounded">disabled: true</code>로 설정하면
              클릭이 차단되고 시각적으로 흐려집니다.
            </p>
          </div>
        </div>
      </Section>

      {/* ── With Badge Demo ── */}
      <Section title="뱃지 활용 예시" description="뱃지를 사용하면 각 탭의 항목 수를 직관적으로 전달할 수 있습니다.">
        <Preview>
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-muted mb-2">Underline + Badge</p>
              <Tabs tabs={demoTabs} value={v} onChange={setV} variant="underline" />
            </div>
            <div>
              <p className="text-xs text-muted mb-2">Pills + Badge</p>
              <Tabs tabs={demoTabs} value={v} onChange={setV} variant="pills" />
            </div>
            <div>
              <p className="text-xs text-muted mb-2">Segment + Badge</p>
              <Tabs tabs={demoTabs} value={v} onChange={setV} variant="segment" />
            </div>
          </div>
        </Preview>
      </Section>

      {/* ── Guidelines ── */}
      <Section title="Guidelines" description="탭을 효과적으로 사용하기 위한 디자인 원칙입니다.">
        <Guidelines
          items={[
            {
              type: "do",
              description: "탭 레이블은 짧고 명확하게 작성하세요. 한 단어 또는 두 단어가 이상적입니다. 사용자가 한눈에 내용을 예측할 수 있어야 합니다.",
            },
            {
              type: "dont",
              description: "탭 개수가 6개를 넘지 않도록 하세요. 탭이 너무 많으면 사용자가 원하는 항목을 찾기 어렵습니다. 많은 경우 드롭다운이나 사이드 네비게이션을 고려하세요.",
            },
            {
              type: "do",
              description: "같은 계층의 관련 콘텐츠를 분류할 때 탭을 사용하세요. 서로 독립적인 페이지 간 이동에는 네비게이션 메뉴가 더 적합합니다.",
            },
            {
              type: "caution",
              description: "탭 간 전환 시 사용자의 입력 데이터가 유실되지 않도록 주의하세요. 폼이 포함된 탭이라면 상태를 보존하는 로직이 필요합니다.",
            },
          ]}
        />
      </Section>

      {/* ── Usage Notes ── */}
      <Section title="사용 시 참고사항">
        <div className="flex flex-col gap-3">
          <UsageNote type="info">
            Tabs 컴포넌트는 탭 목록(Tab List)만 렌더링합니다.
            탭 패널(Tab Panel)의 콘텐츠는 <code className="text-xs bg-gray-100 px-1 rounded">value</code> 상태에 따라 직접 조건부 렌더링하세요.
          </UsageNote>
          <UsageNote type="tip">
            필터링 UI에는 <strong>pills</strong> 변형이 잘 어울립니다.
            페이지 상단 네비게이션에는 <strong>underline</strong>,
            토글 스위치 느낌이 필요하면 <strong>segment</strong>를 사용하세요.
          </UsageNote>
          <UsageNote type="warning">
            탭 value는 고유해야 합니다. 중복된 value가 있으면 예상치 못한 동작이 발생할 수 있습니다.
          </UsageNote>
        </div>
      </Section>

      {/* ── Accessibility ── */}
      <Section title="접근성" description="Tabs는 WAI-ARIA Tabs 패턴을 준수합니다.">
        <AccessibilityNote
          items={[
            "탭 컨테이너에 role='tablist'가 자동으로 적용됩니다.",
            "각 탭 버튼에 role='tab'과 aria-selected가 자동으로 적용되어 활성 상태를 스크린 리더에 전달합니다.",
            "비활성화된 탭은 disabled 속성이 적용되어 키보드와 스크린 리더에서 올바르게 처리됩니다.",
            "탭 패널을 직접 구현할 때는 role='tabpanel'과 aria-labelledby를 사용하여 탭 버튼과 연결하세요.",
            "충분한 색상 대비를 유지하여 저시력 사용자도 활성 탭을 구분할 수 있습니다.",
          ]}
        />
      </Section>

      {/* ── Code Example ── */}
      <Section title="코드 예시" description="Tabs와 조건부 렌더링을 결합하는 기본 패턴입니다.">
        <CodeExample
          code={`import { useState } from "react";
import { Tabs } from "@/ds/composites/Tabs";

function ProjectTabs() {
  const [tab, setTab] = useState("overview");

  const tabs = [
    { value: "overview", label: "개요" },
    { value: "members", label: "멤버", badge: 5 },
    { value: "settings", label: "설정" },
  ];

  return (
    <div>
      <Tabs
        tabs={tabs}
        value={tab}
        onChange={setTab}
        variant="underline"
      />

      <div className="mt-4" role="tabpanel">
        {tab === "overview" && (
          <p>프로젝트 개요 내용...</p>
        )}
        {tab === "members" && (
          <p>멤버 목록...</p>
        )}
        {tab === "settings" && (
          <p>설정 패널...</p>
        )}
      </div>
    </div>
  );
}`}
        />
      </Section>
    </ComponentPage>
  );
}
