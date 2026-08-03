"use client";
import {
  ComponentPage,
  Section,
  Guidelines,
  Anatomy,
  UsageNote,
  AccessibilityNote,
  CodeExample,
  VariantGrid,
  VariantItem,
  DecisionMatrix,
} from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PropsPlayground } from "../../_components/PropsPlayground";
import type { PlaygroundControl } from "../../_components/PropsPlayground";
import { Button } from "@/ds/primitives/Button";
import type { ButtonVariant, ButtonSize } from "@/ds/primitives/Button";

/* ── Inline SVG icons ── */
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M6 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M5 5v7M8 5v7M11 5v7M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M4 4l.7 9.1a1 1 0 001 .9h4.6a1 1 0 001-.9L12 4"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 2v8M5 7l3 3 3-3M3 12h10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3 8.5l3 3 7-7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ── Variant / Size data ── */
const variants: { value: ButtonVariant; label: string; description: string }[] = [
  {
    value: "primary",
    label: "Primary",
    description: "핵심 행동(CTA)에 사용합니다. 화면당 하나가 이상적입니다.",
  },
  {
    value: "secondary",
    label: "Secondary",
    description: "보조 행동에 사용합니다. Primary 옆에 배치되는 경우가 많습니다.",
  },
  {
    value: "danger",
    label: "Danger",
    description: "삭제, 해제 등 되돌리기 어려운 파괴적 행동에 사용합니다.",
  },
  {
    value: "ghost",
    label: "Ghost",
    description: "시각적으로 가장 가벼운 스타일. 툴바나 보조 액션에 적합합니다.",
  },
  {
    value: "outline",
    label: "Outline",
    description: "Secondary와 유사하지만 배경 없이 테두리만 표시됩니다.",
  },
  {
    value: "link",
    label: "Link",
    description: "텍스트 링크처럼 보이지만 버튼 시맨틱을 유지합니다.",
  },
];

const sizes: { value: ButtonSize; label: string; description: string }[] = [
  {
    value: "xs",
    label: "Extra Small (xs)",
    description: "높이 28px. 인라인 액션, 태그 내부 등 좁은 공간에 적합합니다.",
  },
  {
    value: "sm",
    label: "Small (sm)",
    description: "높이 32px. 테이블 행, 카드 내부 등 밀도 높은 UI에 사용합니다.",
  },
  {
    value: "md",
    label: "Medium (md)",
    description: "높이 36px. 기본 크기. 대부분의 폼과 페이지에서 사용합니다.",
  },
  {
    value: "lg",
    label: "Large (lg)",
    description: "높이 44px. 히어로 영역, 모바일 CTA 등 강조가 필요할 때 사용합니다.",
  },
];

/* ── Playground controls ── */
const playgroundControls: PlaygroundControl[] = [
  {
    type: "select",
    name: "variant",
    label: "Variant",
    options: ["primary", "secondary", "danger", "ghost", "outline", "link"],
    defaultValue: "primary",
  },
  {
    type: "select",
    name: "size",
    label: "Size",
    options: ["xs", "sm", "md", "lg"],
    defaultValue: "md",
  },
  { type: "boolean", name: "loading", label: "Loading", defaultValue: false },
  { type: "boolean", name: "disabled", label: "Disabled", defaultValue: false },
  { type: "boolean", name: "fullWidth", label: "Full Width", defaultValue: false },
  { type: "text", name: "children", label: "Children", defaultValue: "버튼" },
];

export default function ButtonPage() {
  return (
    <ComponentPage
      name="Button"
      description="사용자의 행동을 유도하는 가장 기본적인 인터랙티브 요소입니다. 6가지 variant, 4가지 size, 로딩/비활성 상태, 아이콘을 지원하며 모든 디자인 시스템의 핵심 컴포넌트입니다."
      importPath='import { Button } from "@/ds/primitives/Button"'
      status="stable"
      version="2.2.0"
      props={[
        {
          name: "variant",
          type: '"primary" | "secondary" | "danger" | "ghost" | "outline" | "link"',
          default: '"primary"',
          description: "버튼의 시각적 스타일을 결정합니다.",
        },
        {
          name: "size",
          type: '"xs" | "sm" | "md" | "lg"',
          default: '"md"',
          description: "버튼의 높이, 패딩, 폰트 크기를 결정합니다.",
        },
        {
          name: "loading",
          type: "boolean",
          default: "false",
          description: "로딩 상태를 표시합니다. true일 때 스피너가 나타나고 클릭이 비활성화됩니다.",
        },
        {
          name: "leftIcon",
          type: "ReactNode",
          description: "레이블 왼쪽에 렌더링되는 아이콘입니다.",
        },
        {
          name: "rightIcon",
          type: "ReactNode",
          description: "레이블 오른쪽에 렌더링되는 아이콘입니다.",
        },
        {
          name: "fullWidth",
          type: "boolean",
          default: "false",
          description: "true일 때 부모 컨테이너 너비를 100% 채웁니다.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "비활성 상태. 클릭과 포커스가 불가능합니다.",
        },
        { name: "className", type: "string", description: "추가 CSS 클래스를 전달합니다." },
        {
          name: "children",
          type: "ReactNode",
          description: "버튼 내부에 표시되는 레이블 텍스트입니다.",
        },
      ]}
      related={[
        { name: "IconButton", href: "/design-system/primitives/icon-button" },
        { name: "ButtonGroup", href: "/design-system/composites/button-group" },
        { name: "FloatingActionButton", href: "/design-system/composites/floating-action-button" },
      ]}
    >
      {/* ═══════════════════ 1. Overview Preview ═══════════════════ */}
      <Section
        title="Overview"
        description="가장 일반적인 사용 형태입니다. Primary 버튼과 Secondary 버튼을 함께 배치하여 주요 행동과 보조 행동을 구분합니다."
      >
        <Preview
          sourceCode={`<div className="flex flex-col items-center gap-6">
  <div className="flex items-center gap-3">
    <Button variant="primary" leftIcon={<CheckIcon />}>변경사항 저장</Button>
    <Button variant="secondary">취소</Button>
  </div>
  <div className="flex items-center gap-3">
    <Button variant="danger" leftIcon={<TrashIcon />}>삭제</Button>
    <Button variant="ghost">건너뛰기</Button>
    <Button variant="link">자세히 보기</Button>
  </div>
</div>`}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <Button variant="primary" leftIcon={<CheckIcon />}>
                변경사항 저장
              </Button>
              <Button variant="secondary">취소</Button>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="danger" leftIcon={<TrashIcon />}>
                삭제
              </Button>
              <Button variant="ghost">건너뛰기</Button>
              <Button variant="link">자세히 보기</Button>
            </div>
          </div>
        </Preview>
      </Section>

      {/* ═══════════════════ 1.5. Interactive Playground ═══════════════════ */}
      <Section
        title="Interactive Playground"
        description="Props를 실시간으로 조정하며 Button의 다양한 조합을 탐색해 보세요."
      >
        <PropsPlayground
          componentName="Button"
          controls={playgroundControls}
          renderPreview={(props) => (
            <Button
              variant={props.variant as ButtonVariant}
              size={props.size as ButtonSize}
              loading={props.loading as boolean}
              disabled={props.disabled as boolean}
              fullWidth={props.fullWidth as boolean}
            >
              {String(props.children || "버튼")}
            </Button>
          )}
        />
      </Section>

      {/* ═══════════════════ 2. Anatomy ═══════════════════ */}
      <Section title="Anatomy" description="Button 컴포넌트를 구성하는 내부 요소들입니다.">
        <Preview
          sourceCode={`<Button variant="primary" size="lg" leftIcon={<PlusIcon />}>
  새 항목 추가
</Button>`}
        >
          <div className="flex items-center justify-center">
            <Button variant="primary" size="lg" leftIcon={<PlusIcon />}>
              새 항목 추가
            </Button>
          </div>
        </Preview>
        <div className="mt-4">
          <Anatomy
            items={[
              {
                label: "Container",
                description:
                  "버튼의 외부 컨테이너. variant에 따라 배경색, 테두리, 그림자가 달라지며 size에 따라 높이와 패딩이 결정됩니다.",
              },
              {
                label: "Label",
                description:
                  "버튼 내부의 텍스트 레이블. 사용자에게 어떤 행동이 실행되는지 명확하게 전달합니다.",
              },
              {
                label: "Icon (Left / Right)",
                description:
                  "레이블 좌측 또는 우측에 배치되는 아이콘. 행동의 의미를 시각적으로 보완합니다.",
              },
              {
                label: "Spinner",
                description:
                  "loading 상태일 때 leftIcon 자리에 표시되는 회전 애니메이션. 비동기 작업이 진행 중임을 나타냅니다.",
              },
            ]}
          />
        </div>
      </Section>

      {/* ═══════════════════ 3. Variants ═══════════════════ */}
      <Section
        title="Variants"
        description="용도에 따라 6가지 variant를 제공합니다. 각 variant는 시각적 위계와 의미가 다릅니다."
      >
        <VariantGrid cols={3}>
          {variants.map((v) => (
            <VariantItem
              key={v.value}
              label={v.label}
              description={v.description}
              sourceCode={`<Button variant="${v.value}">${v.label}</Button>`}
            >
              <Button variant={v.value}>{v.label}</Button>
            </VariantItem>
          ))}
        </VariantGrid>
      </Section>

      {/* ═══════════════════ 4. Sizes ═══════════════════ */}
      <Section title="Sizes" description="UI 밀도와 맥락에 맞게 4가지 크기를 지원합니다.">
        <VariantGrid cols={2}>
          {sizes.map((s) => (
            <VariantItem
              key={s.value}
              label={s.label}
              description={s.description}
              sourceCode={`<Button size="${s.value}">버튼</Button>`}
            >
              <Button size={s.value}>버튼</Button>
            </VariantItem>
          ))}
        </VariantGrid>
        <div className="mt-4">
          <Preview
            sourceCode={`<div className="flex items-end gap-3">
${sizes.map((s) => `  <Button size="${s.value}">${s.label.split(" ")[0]}</Button>`).join("\n")}
</div>`}
          >
            <div className="flex items-end gap-3 justify-center">
              {sizes.map((s) => (
                <Button key={s.value} size={s.value}>
                  {s.label.split(" ")[0]}
                </Button>
              ))}
            </div>
          </Preview>
        </div>
      </Section>

      {/* ═══════════════════ 5. States ═══════════════════ */}
      <Section title="States" description="로딩, 비활성, 아이콘 등 다양한 상태를 지원합니다.">
        <VariantGrid cols={2}>
          <VariantItem
            label="Loading"
            description="비동기 작업 진행 중. 스피너가 표시되고 클릭이 차단됩니다."
            sourceCode={`<Button loading>저장 중...</Button>
<Button variant="danger" loading>삭제 중...</Button>`}
          >
            <div className="flex items-center gap-3">
              <Button loading>저장 중...</Button>
              <Button variant="danger" loading>
                삭제 중...
              </Button>
            </div>
          </VariantItem>
          <VariantItem
            label="Disabled"
            description="상호작용이 불가능한 비활성 상태입니다."
            sourceCode={`<Button disabled>비활성</Button>
<Button variant="secondary" disabled>비활성</Button>`}
          >
            <div className="flex items-center gap-3">
              <Button disabled>비활성</Button>
              <Button variant="secondary" disabled>
                비활성
              </Button>
            </div>
          </VariantItem>
          <VariantItem
            label="With Left Icon"
            description="레이블 앞에 아이콘을 추가하여 행동의 의미를 보강합니다."
            sourceCode={`<Button leftIcon={<PlusIcon />}>추가</Button>
<Button variant="danger" leftIcon={<TrashIcon />}>삭제</Button>`}
          >
            <div className="flex items-center gap-3">
              <Button leftIcon={<PlusIcon />}>추가</Button>
              <Button variant="danger" leftIcon={<TrashIcon />}>
                삭제
              </Button>
            </div>
          </VariantItem>
          <VariantItem
            label="With Right Icon"
            description="레이블 뒤에 아이콘을 추가합니다. 방향성 표시에 적합합니다."
            sourceCode={`<Button variant="secondary" rightIcon={<ArrowRightIcon />}>다음</Button>
<Button variant="outline" rightIcon={<DownloadIcon />}>다운로드</Button>`}
          >
            <div className="flex items-center gap-3">
              <Button variant="secondary" rightIcon={<ArrowRightIcon />}>
                다음
              </Button>
              <Button variant="outline" rightIcon={<DownloadIcon />}>
                다운로드
              </Button>
            </div>
          </VariantItem>
        </VariantGrid>

        <div className="mt-4">
          <Preview
            sourceCode={`<div className="flex flex-col gap-3">
  <Button fullWidth variant="primary" leftIcon={<CheckIcon />}>전체 너비 버튼</Button>
  <Button fullWidth variant="secondary">전체 너비 보조 버튼</Button>
</div>`}
          >
            <div className="flex flex-col gap-3">
              <Button fullWidth variant="primary" leftIcon={<CheckIcon />}>
                전체 너비 버튼
              </Button>
              <Button fullWidth variant="secondary">
                전체 너비 보조 버튼
              </Button>
            </div>
          </Preview>
        </div>
      </Section>

      {/* ═══════════════════ 5.5 Decision Matrix ═══════════════════ */}
      <Section
        title="비슷한 버튼 컴포넌트 비교"
        description="버튼 형태의 컴포넌트가 여럿 있습니다. 의도에 맞는 것을 선택하세요."
      >
        <DecisionMatrix
          rows={[
            {
              name: "Button",
              href: "/design-system/primitives/button",
              signature: "텍스트 액션",
              useWhen:
                "레이블 텍스트가 있는 일반 액션 — 폼 제출, 모달 닫기, 페이지 이동 등 대부분의 클릭 가능한 행동.",
              avoidWhen: "아이콘만 있는 액션은 IconButton — 접근성/터치 타겟이 자동 보장됨.",
            },
            {
              name: "IconButton",
              href: "/design-system/primitives/icon-button",
              signature: "아이콘 단독",
              useWhen:
                "툴바·헤더의 닫기/메뉴/필터 등 아이콘만으로 의미가 분명한 액션. aria-label 필수.",
              avoidWhen: "아이콘의 의미가 모호하면 Button + leftIcon으로 텍스트를 함께 노출.",
            },
            {
              name: "ButtonGroup",
              href: "/design-system/composites/button-group",
              signature: "연속 버튼",
              useWhen: "정렬·필터·뷰 전환처럼 상호 배타적인 옵션을 한 줄로 묶어 보여줄 때.",
              avoidWhen: "단일 액션 — 그냥 Button을 사용.",
            },
            {
              name: "FloatingActionButton",
              href: "/design-system/composites/floating-action-button",
              signature: "고정 부유",
              useWhen:
                "모바일·앱 화면에서 가장 중요한 단일 액션을 우하단에 부유시켜 항상 접근 가능하게.",
              avoidWhen: "데스크탑 폼·관리자 화면 — 일반 Button이 더 자연스러움.",
            },
          ]}
        />
      </Section>

      {/* ═══════════════════ 6. Usage Guidelines ═══════════════════ */}
      <Section title="Usage Guidelines" description="올바른 사용법과 피해야 할 패턴입니다.">
        <Guidelines
          items={[
            {
              type: "do",
              description:
                "한 화면에 Primary 버튼은 하나만 사용하세요. 사용자의 시선이 핵심 행동에 집중됩니다.",
              preview: (
                <div className="flex items-center gap-3">
                  <Button variant="primary">저장</Button>
                  <Button variant="secondary">취소</Button>
                </div>
              ),
            },
            {
              type: "dont",
              description:
                "여러 개의 Primary 버튼을 나란히 배치하지 마세요. 사용자가 어떤 것이 핵심 행동인지 혼란스러워합니다.",
              preview: (
                <div className="flex items-center gap-3">
                  <Button variant="primary">저장</Button>
                  <Button variant="primary">취소</Button>
                  <Button variant="primary">삭제</Button>
                </div>
              ),
            },
            {
              type: "do",
              description:
                "버튼 레이블은 짧고 행동 중심으로 작성하세요. 동사로 시작하면 무엇이 실행되는지 명확합니다.",
              preview: (
                <div className="flex items-center gap-3">
                  <Button variant="primary" leftIcon={<CheckIcon />}>
                    저장
                  </Button>
                  <Button variant="danger" leftIcon={<TrashIcon />}>
                    삭제
                  </Button>
                </div>
              ),
            },
            {
              type: "dont",
              description:
                "긴 텍스트를 버튼 레이블에 넣지 마세요. 레이블이 길면 행동이 불분명해지고 레이아웃이 깨질 수 있습니다.",
              preview: <Button variant="primary">여기를 클릭하면 변경사항이 저장됩니다</Button>,
            },
            {
              type: "caution",
              description:
                "Danger 버튼은 파괴적 행동에만 사용하세요. 삭제, 해제 등 되돌릴 수 없는 작업에 한정하고 반드시 확인 단계를 추가하세요.",
              preview: (
                <Button variant="danger" leftIcon={<TrashIcon />}>
                  계정 삭제
                </Button>
              ),
            },
            {
              type: "do",
              description:
                "로딩 상태에서는 어떤 작업이 진행 중인지 레이블로 알려주세요. 사용자가 현재 상황을 이해할 수 있습니다.",
              preview: (
                <Button variant="primary" loading>
                  저장 중...
                </Button>
              ),
            },
          ]}
        />
      </Section>

      {/* ═══════════════════ 7. Usage Notes ═══════════════════ */}
      <Section title="Usage Notes" description="각 variant의 적절한 사용 시점과 팁입니다.">
        <div className="flex flex-col gap-3">
          <UsageNote type="info">
            <strong>Primary</strong>는 화면에서 가장 중요한 행동(CTA)에 사용합니다.
            &quot;저장&quot;, &quot;제출&quot;, &quot;다음 단계&quot; 등이 해당됩니다. 한 화면에
            하나만 사용하는 것이 이상적입니다.
          </UsageNote>
          <UsageNote type="info">
            <strong>Secondary</strong>와 <strong>Outline</strong>은 보조 행동에 사용합니다. Primary
            버튼과 함께 배치되는 &quot;취소&quot;, &quot;이전&quot; 등에 적합합니다.
          </UsageNote>
          <UsageNote type="warning">
            <strong>Danger</strong> variant는 데이터 삭제, 계정 해제 등 되돌릴 수 없는 파괴적
            행동에만 사용하세요. 반드시 확인 대화상자를 함께 사용하는 것을 권장합니다.
          </UsageNote>
          <UsageNote type="tip">
            <strong>Ghost</strong>와 <strong>Link</strong>는 시각적 무게가 가벼워 툴바, 인라인 액션,
            부가 정보 링크에 적합합니다. 페이지 내 네비게이션이 필요하면 Link variant 대신 실제{" "}
            <code>&lt;a&gt;</code> 태그 사용을 고려하세요.
          </UsageNote>
          <UsageNote type="tip">
            <strong>fullWidth</strong> 옵션은 모바일 화면 하단 CTA, 모달 내부 확인 버튼 등 버튼이
            컨테이너 전체를 차지해야 할 때 사용합니다.
          </UsageNote>
        </div>
      </Section>

      {/* ═══════════════════ 8. Accessibility ═══════════════════ */}
      <Section
        title="Accessibility"
        description="모든 사용자가 불편 없이 사용할 수 있도록 다음 접근성 요구사항을 준수합니다."
      >
        <AccessibilityNote
          items={[
            "키보드 내비게이션: Tab 키로 포커스 이동, Enter 또는 Space 키로 클릭이 가능합니다.",
            "포커스 표시: focus-visible 상태에서 Primary 색상의 링(ring)이 표시되어 현재 포커스 위치를 시각적으로 나타냅니다.",
            '로딩 상태: loading={true}일 때 aria-busy="true"가 자동으로 설정되어 스크린 리더에 작업 진행 중임을 알립니다.',
            "비활성 상태: disabled일 때 opacity가 낮아지고 pointer-events가 비활성화되며 탭 순서에서 제외됩니다.",
            "아이콘 전용 버튼을 만들 경우 반드시 aria-label을 제공하세요. IconButton 컴포넌트 사용을 권장합니다.",
            "색상 대비: 모든 variant는 WCAG 2.1 AA 기준(4.5:1) 이상의 텍스트 대비를 충족합니다.",
            '스피너 아이콘에는 aria-hidden="true"가 적용되어 스크린 리더가 장식 요소를 무시합니다.',
          ]}
        />
      </Section>

      {/* ═══════════════════ 9. Code Examples ═══════════════════ */}
      <Section title="Code Examples" description="실제 프로젝트에서 자주 사용되는 코드 패턴입니다.">
        <div className="flex flex-col gap-4">
          <CodeExample
            code={`// 기본 사용
<Button variant="primary" size="md">
  저장
</Button>`}
          />

          <CodeExample
            code={`// 비동기 작업과 함께 사용
const [isPending, startTransition] = useTransition();

<Button
  variant="primary"
  loading={isPending}
  onClick={() => startTransition(async () => {
    await saveData();
  })}
>
  {isPending ? "저장 중..." : "저장"}
</Button>`}
          />

          <CodeExample
            code={`// 아이콘과 함께 사용
<Button
  variant="danger"
  leftIcon={<TrashIcon />}
  onClick={handleDelete}
>
  삭제
</Button>

<Button
  variant="secondary"
  rightIcon={<ArrowRightIcon />}
>
  다음 단계
</Button>`}
          />

          <CodeExample
            code={`// 전체 너비 (모바일 CTA)
<div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
  <Button variant="primary" fullWidth size="lg">
    결제하기
  </Button>
</div>`}
          />

          <CodeExample
            code={`// Variant 조합 예시
<div className="flex items-center gap-3">
  <Button variant="primary" leftIcon={<CheckIcon />}>
    확인
  </Button>
  <Button variant="secondary">
    취소
  </Button>
  <Button variant="ghost">
    건너뛰기
  </Button>
</div>`}
          />
        </div>
      </Section>
    </ComponentPage>
  );
}
