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
} from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Badge } from "@/ds/primitives/Badge";
import type { BadgeVariant } from "@/ds/primitives/Badge";

const allVariants: BadgeVariant[] = [
  "default",
  "primary",
  "success",
  "warning",
  "danger",
  "info",
  "outline",
];

export default function BadgePage() {
  return (
    <ComponentPage
      name="Badge"
      description="상태, 카운트, 라벨 등을 시각적으로 구분하여 표시하는 인라인 요소입니다. 간결한 정보를 전달하는 데 최적화되어 있으며, 다양한 색상 변형과 크기를 지원합니다."
      importPath='import { Badge } from "@/ds/primitives/Badge"'
      status="stable"
      version="1.0.0"
      props={[
        {
          name: "variant",
          type: '"default" | "primary" | "success" | "warning" | "danger" | "info" | "outline"',
          default: '"default"',
          description:
            "Badge의 색상 스타일을 결정합니다. 전달하려는 정보의 성격에 맞는 변형을 선택하세요.",
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "Badge의 크기를 설정합니다.",
        },
        {
          name: "dot",
          type: "boolean",
          default: "false",
          description: "라벨 앞에 상태를 나타내는 컬러 점을 표시합니다.",
        },
        {
          name: "count",
          type: "number",
          description: "숫자 카운트 모드로 전환합니다. 알림 개수 등에 사용합니다.",
        },
        {
          name: "maxCount",
          type: "number",
          default: "99",
          description: "count 모드에서 표시할 최대 숫자입니다. 초과 시 '99+' 형태로 표시됩니다.",
        },
        {
          name: "children",
          type: "ReactNode",
          description: "Badge 내부에 표시할 텍스트 또는 요소",
        },
      ]}
      related={[
        { name: "Tag", href: "/design-system/primitives/tag" },
        { name: "StatusDot", href: "/design-system/primitives/status-dot" },
        { name: "SeverityBadge", href: "/design-system/composites/severity-badge" },
      ]}
    >
      {/* ── 개요 ── */}
      <Section
        title="개요"
        description="Badge는 짧은 텍스트로 상태, 카테고리, 숫자 등의 정보를 시각적으로 전달합니다."
      >
        <Preview
          sourceCode={`<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="outline">Outline</Badge>`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {allVariants.map((v) => (
              <Badge key={v} variant={v}>
                {v}
              </Badge>
            ))}
          </div>
        </Preview>
      </Section>

      {/* ── 변형 ── */}
      <Section
        title="변형 (Variants)"
        description="7가지 색상 변형을 제공합니다. 정보의 성격에 맞는 변형을 선택하세요."
      >
        <VariantGrid cols={3}>
          {allVariants.map((v) => (
            <VariantItem
              key={v}
              label={v.charAt(0).toUpperCase() + v.slice(1)}
              description={
                v === "default"
                  ? "일반적인 라벨 표시에 사용"
                  : v === "primary"
                  ? "주요 정보, 브랜드 강조에 사용"
                  : v === "success"
                  ? "성공, 완료, 활성 상태 표시"
                  : v === "warning"
                  ? "주의가 필요한 상태 표시"
                  : v === "danger"
                  ? "에러, 삭제, 위험 상태 표시"
                  : v === "info"
                  ? "참고 정보, 부가 설명 표시"
                  : "배경 없이 테두리만 사용하는 미니멀한 스타일"
              }
              sourceCode={`<Badge variant="${v}">${v.charAt(0).toUpperCase() + v.slice(1)}</Badge>`}
            >
              <Badge variant={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Badge>
            </VariantItem>
          ))}
        </VariantGrid>
      </Section>

      {/* ── 크기 ── */}
      <Section
        title="크기 (Sizes)"
        description="sm, md, lg 세 가지 크기를 지원합니다. 주변 텍스트와 조화를 이루도록 적절한 크기를 선택하세요."
      >
        <Preview
          sourceCode={`<Badge size="sm" variant="primary">Small</Badge>
<Badge size="md" variant="primary">Medium</Badge>
<Badge size="lg" variant="primary">Large</Badge>`}
        >
          <div className="flex items-center gap-3">
            <Badge size="sm" variant="primary">
              Small
            </Badge>
            <Badge size="md" variant="primary">
              Medium
            </Badge>
            <Badge size="lg" variant="primary">
              Large
            </Badge>
          </div>
        </Preview>
        <UsageNote type="info">
          <code className="text-xs font-mono bg-gray-100 px-1 rounded">sm</code>은 테이블 셀, 목록
          항목 등 공간이 제한된 곳에 적합합니다.{" "}
          <code className="text-xs font-mono bg-gray-100 px-1 rounded">lg</code>는 페이지 제목
          옆이나 강조가 필요한 곳에 사용하세요.
        </UsageNote>
      </Section>

      {/* ── Dot 인디케이터 ── */}
      <Section
        title="Dot 인디케이터"
        description="dot 속성을 추가하면 라벨 앞에 현재 상태를 나타내는 컬러 점이 표시됩니다. 실시간 상태 표시에 유용합니다."
      >
        <Preview
          sourceCode={`<Badge variant="success" dot>온라인</Badge>
<Badge variant="danger" dot>오프라인</Badge>
<Badge variant="warning" dot>자리 비움</Badge>`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {allVariants.map((v) => (
              <Badge key={v} variant={v} dot>
                {v}
              </Badge>
            ))}
          </div>
        </Preview>
      </Section>

      {/* ── 카운트 배지 ── */}
      <Section
        title="카운트 배지"
        description="count 속성을 사용하면 숫자를 표시하는 카운트 모드로 전환됩니다. 알림 수, 메시지 수 등에 활용합니다."
      >
        <Preview
          sourceCode={`<Badge count={5} />
<Badge count={42} />
<Badge count={150} maxCount={99} />  {/* "99+" 표시 */}
<Badge count={999} maxCount={999} />`}
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <Badge count={5} />
              <span className="text-[10px] text-muted">기본</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Badge count={42} />
              <span className="text-[10px] text-muted">두 자리</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Badge count={150} maxCount={99} />
              <span className="text-[10px] text-muted">초과 (99+)</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Badge count={999} maxCount={999} />
              <span className="text-[10px] text-muted">세 자리</span>
            </div>
          </div>
        </Preview>
        <UsageNote type="tip">
          <code className="text-xs font-mono bg-gray-100 px-1 rounded">maxCount</code>를 설정하면 큰
          숫자를 간결하게 표현할 수 있습니다. 기본값은 99이며, 초과 시 &quot;99+&quot;로 표시됩니다.
        </UsageNote>
      </Section>

      {/* ── 실제 활용 예시 ── */}
      <Section
        title="실제 활용 예시"
        description="Badge가 다양한 UI 맥락에서 어떻게 활용되는지 보여줍니다."
      >
        <Preview>
          <div className="flex flex-col gap-4 w-full max-w-md">
            {/* 상태 표시 */}
            <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-border-light">
              <span className="text-sm text-foreground">서버 상태</span>
              <Badge variant="success" dot size="sm">
                정상
              </Badge>
            </div>
            {/* 카테고리 태그 */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border-light">
              <span className="text-sm text-foreground mr-auto">기술 스택</span>
              <Badge variant="primary" size="sm">
                React
              </Badge>
              <Badge variant="info" size="sm">
                TypeScript
              </Badge>
              <Badge variant="outline" size="sm">
                Tailwind
              </Badge>
            </div>
            {/* 버전 표시 */}
            <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-border-light">
              <span className="text-sm text-foreground">릴리스</span>
              <div className="flex items-center gap-2">
                <Badge variant="default" size="sm">
                  v2.1.0
                </Badge>
                <Badge variant="warning" size="sm">
                  Beta
                </Badge>
              </div>
            </div>
          </div>
        </Preview>
      </Section>

      {/* ── 가이드라인 ── */}
      <Section title="가이드라인">
        <Guidelines
          items={[
            {
              type: "do",
              description:
                "짧고 명확한 텍스트만 사용하세요. 한두 단어가 이상적입니다. (예: '신규', '완료', 'Beta')",
            },
            {
              type: "dont",
              description:
                "문장이나 긴 설명을 Badge에 넣지 마세요. Badge는 라벨이지, 문단이 아닙니다.",
            },
            {
              type: "do",
              description:
                "의미에 맞는 색상 변형을 일관되게 사용하세요. success는 긍정적 상태, danger는 부정적 상태에 사용합니다.",
            },
            {
              type: "dont",
              description:
                "하나의 요소에 3개 이상의 Badge를 나열하지 마세요. 정보 과부하로 가독성이 떨어집니다.",
            },
            {
              type: "caution",
              description:
                "색상만으로 정보를 전달하지 마세요. 색각 이상이 있는 사용자를 위해 텍스트와 함께 사용합니다.",
            },
            {
              type: "do",
              description:
                "카운트 배지는 실시간 업데이트가 필요한 곳(알림, 메시지 등)에 사용하세요.",
            },
          ]}
        />
      </Section>

      {/* ── 접근성 ── */}
      <Section title="접근성">
        <AccessibilityNote
          items={[
            "Badge는 시멘틱 span 요소로 렌더링됩니다. 스크린 리더가 자연스럽게 인라인 텍스트로 읽습니다.",
            "색상만으로 의미를 전달하지 않습니다. 항상 텍스트 라벨과 함께 사용하여 색각 이상 사용자도 정보를 이해할 수 있게 합니다.",
            "dot 인디케이터는 시각적 보조 역할이며, 상태 정보는 반드시 텍스트로도 전달되어야 합니다.",
            "카운트 배지의 숫자는 스크린 리더가 읽을 수 있으며, maxCount 초과 시 '{maxCount}+' 형태로 전달됩니다.",
            "대비 비율이 WCAG 2.1 AA 기준을 충족하도록 설계되었습니다.",
          ]}
        />
      </Section>

      {/* ── 사용 예시 코드 ── */}
      <Section title="사용 예시">
        <CodeExample
          code={`// 기본 변형
<Badge variant="success">완료</Badge>
<Badge variant="danger">실패</Badge>

// Dot 인디케이터
<Badge variant="success" dot>온라인</Badge>
<Badge variant="warning" dot>자리 비움</Badge>

// 크기 조절
<Badge size="sm" variant="primary">Small</Badge>
<Badge size="lg" variant="primary">Large</Badge>

// 카운트 모드
<Badge count={5} />
<Badge count={150} maxCount={99} />  // "99+" 표시

// 실제 활용: 목록 항목 상태 표시
<div className="flex items-center gap-2">
  <span>배포 상태</span>
  <Badge variant="success" dot size="sm">운영 중</Badge>
</div>`}
        />
      </Section>
    </ComponentPage>
  );
}
