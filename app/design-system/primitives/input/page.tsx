"use client";
import { ComponentPage, Section, Guidelines, Anatomy, UsageNote, AccessibilityNote, CodeExample, VariantGrid, VariantItem } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Input } from "@/ds/primitives/Input";

export default function InputPage() {
  return (
    <ComponentPage
      name="Input"
      description="사용자로부터 텍스트를 입력받는 기본 컴포넌트입니다. 다양한 크기, 에러 상태, 좌우 슬롯을 통한 아이콘 배치를 지원하며, 폼 내에서 가장 빈번하게 사용됩니다."
      importPath='import { Input } from "@/ds/primitives/Input"'
      status="stable"
      version="1.0.0"
      props={[
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "입력 필드의 크기를 결정합니다. 주변 UI 밀도에 맞춰 선택하세요." },
        { name: "error", type: "boolean", default: "false", description: "에러 상태를 시각적으로 표시합니다. border 색상이 danger 색상으로 변경됩니다." },
        { name: "leftSlot", type: "ReactNode", description: "입력 필드 왼쪽에 렌더링할 아이콘 또는 요소입니다. 검색 아이콘 등에 활용합니다." },
        { name: "rightSlot", type: "ReactNode", description: "입력 필드 오른쪽에 렌더링할 아이콘 또는 요소입니다. 클리어 버튼, 단위 표시 등에 활용합니다." },
        { name: "placeholder", type: "string", description: "입력 전 힌트 텍스트입니다. 짧고 명확한 안내 문구를 사용하세요." },
        { name: "disabled", type: "boolean", default: "false", description: "비활성화 상태입니다. 시각적으로 흐려지며 상호작용이 차단됩니다." },
      ]}
      related={[
        { name: "Textarea", href: "/design-system/primitives/textarea" },
        { name: "PasswordInput", href: "/design-system/composites/password-input" },
        { name: "SearchInput", href: "/design-system/composites/search-input" },
        { name: "NumberInput", href: "/design-system/composites/number-input" },
      ]}
    >
      {/* ── Overview ── */}
      <Section title="Overview" description="기본적인 텍스트 입력 필드입니다. 대부분의 폼에서 이름, 이메일, 주소 등 한 줄짜리 텍스트 데이터를 수집할 때 사용합니다.">
        <Preview>
          <div className="flex flex-col gap-3 max-w-sm">
            <Input placeholder="이름을 입력하세요" />
          </div>
        </Preview>
      </Section>

      {/* ── Anatomy ── */}
      <Section title="Anatomy" description="Input 컴포넌트를 구성하는 내부 요소들입니다.">
        <Anatomy
          items={[
            { label: "Container", description: "입력 필드를 감싸는 최외곽 컨테이너입니다. border, 배경색, focus ring 등 시각적 상태를 담당합니다." },
            { label: "Placeholder", description: "값이 비어있을 때 표시되는 힌트 텍스트입니다. 입력을 시작하면 사라집니다." },
            { label: "Left Slot", description: "입력 필드 왼쪽에 위치하는 아이콘 또는 요소 영역입니다. 검색, 통화 기호 등 맥락 정보를 제공합니다." },
            { label: "Right Slot", description: "입력 필드 오른쪽에 위치하는 아이콘 또는 요소 영역입니다. 지우기 버튼, 단위(원, kg) 등을 표시합니다." },
          ]}
        />
      </Section>

      {/* ── Sizes ── */}
      <Section title="Sizes" description="주변 레이아웃의 밀도에 맞춰 3가지 크기를 제공합니다. 기본값은 md이며, 대부분의 경우 md를 권장합니다.">
        <VariantGrid cols={3}>
          <VariantItem label="Small (sm)" description="밀도가 높은 UI, 테이블 내 인라인 편집 등에 적합합니다.">
            <Input size="sm" placeholder="Small input" />
          </VariantItem>
          <VariantItem label="Medium (md)" description="기본 크기입니다. 일반적인 폼 필드에 사용합니다.">
            <Input size="md" placeholder="Medium input" />
          </VariantItem>
          <VariantItem label="Large (lg)" description="강조가 필요한 입력, 랜딩 페이지 검색창 등에 적합합니다.">
            <Input size="lg" placeholder="Large input" />
          </VariantItem>
        </VariantGrid>
      </Section>

      {/* ── States ── */}
      <Section title="States" description="Input은 상호작용 상태에 따라 시각적 피드백을 제공합니다.">
        <VariantGrid cols={2}>
          <VariantItem label="Default" description="기본 상태입니다. 클릭하면 focus ring이 나타납니다.">
            <Input placeholder="기본 상태" />
          </VariantItem>
          <VariantItem label="Error" description="유효성 검증 실패 시 빨간색 border로 에러를 표시합니다.">
            <Input error placeholder="에러 상태" />
          </VariantItem>
          <VariantItem label="Disabled" description="비활성화 상태입니다. 클릭과 입력이 차단됩니다.">
            <Input disabled placeholder="비활성화 상태" />
          </VariantItem>
          <VariantItem label="With Icon" description="leftSlot을 활용해 검색 아이콘을 배치한 예시입니다.">
            <Input
              placeholder="검색..."
              leftSlot={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
            />
          </VariantItem>
        </VariantGrid>
      </Section>

      {/* ── With Slots ── */}
      <Section title="슬롯 활용 예시" description="leftSlot과 rightSlot을 조합하면 다양한 입력 패턴을 만들 수 있습니다.">
        <Preview>
          <div className="flex flex-col gap-3 max-w-sm">
            <Input
              placeholder="검색어를 입력하세요"
              leftSlot={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
            />
            <Input
              placeholder="0"
              rightSlot={<span className="text-xs text-muted font-medium">원</span>}
            />
            <Input
              placeholder="이메일"
              leftSlot={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M1 4.5L7 8L13 4.5" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              }
            />
          </div>
        </Preview>
      </Section>

      {/* ── Guidelines ── */}
      <Section title="Guidelines" description="Input 컴포넌트를 올바르게 사용하기 위한 가이드라인입니다.">
        <Guidelines
          items={[
            {
              type: "do",
              description: "placeholder는 입력 형식에 대한 짧은 힌트만 제공하세요. 예: '홍길동', 'example@email.com'",
            },
            {
              type: "dont",
              description: "label 없이 Input을 단독으로 사용하지 마세요. 시각적 레이블이 없으면 사용자가 어떤 정보를 입력해야 하는지 알 수 없습니다.",
            },
            {
              type: "do",
              description: "에러 상태일 때는 Input 아래에 구체적인 에러 메시지를 함께 표시하세요. 빨간 border만으로는 원인을 알 수 없습니다.",
            },
            {
              type: "dont",
              description: "placeholder를 label 대용으로 사용하지 마세요. 입력을 시작하면 placeholder가 사라지므로 맥락을 잃게 됩니다.",
            },
          ]}
        />
      </Section>

      {/* ── Usage Note ── */}
      <Section title="사용 시 참고사항">
        <div className="flex flex-col gap-3">
          <UsageNote type="info">
            Input의 <code className="text-xs bg-gray-100 px-1 rounded">size</code> prop은 HTML의 기본 <code className="text-xs bg-gray-100 px-1 rounded">size</code> 속성을 오버라이드합니다.
            HTML 기본 size 속성이 필요한 경우는 거의 없으므로 걱정하지 않아도 됩니다.
          </UsageNote>
          <UsageNote type="tip">
            비밀번호 입력이 필요하다면 Input 대신 <strong>PasswordInput</strong> 컴포넌트를 사용하세요.
            표시/숨기기 토글과 강도 표시기가 내장되어 있습니다.
          </UsageNote>
          <UsageNote type="warning">
            에러 상태를 표시할 때 반드시 <code className="text-xs bg-gray-100 px-1 rounded">aria-describedby</code>를 사용하여 에러 메시지와 Input을 연결하세요.
            스크린 리더 사용자가 에러 내용을 인식할 수 있습니다.
          </UsageNote>
        </div>
      </Section>

      {/* ── Accessibility ── */}
      <Section title="접근성" description="Input 컴포넌트는 WAI-ARIA 가이드라인을 준수합니다.">
        <AccessibilityNote
          items={[
            "에러 상태일 때 aria-invalid='true'와 aria-describedby를 사용하여 에러 메시지를 연결하세요.",
            "모든 Input에는 시각적 <label>이 연결되어야 합니다. htmlFor와 id를 매칭하세요.",
            "focus 시 3px primary 색상의 focus ring이 자동으로 표시되어 키보드 사용자의 현재 위치를 알 수 있습니다.",
            "disabled 상태에서는 Tab 키로 포커스되지 않으며, 스크린 리더에 '비활성화됨'으로 안내됩니다.",
            "leftSlot/rightSlot의 아이콘이 장식용이면 aria-hidden='true'를, 의미가 있으면 적절한 aria-label을 부여하세요.",
          ]}
        />
      </Section>

      {/* ── Code Example ── */}
      <Section title="코드 예시" description="폼 내에서 Input을 사용하는 전형적인 패턴입니다.">
        <CodeExample
          code={`import { Input } from "@/ds/primitives/Input";
import { useState } from "react";

function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!email.includes("@")) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }
    // 제출 로직
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">이름</label>
      <Input
        id="name"
        size="md"
        placeholder="홍길동"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label htmlFor="email">이메일</label>
      <Input
        id="email"
        size="md"
        placeholder="example@email.com"
        error={!!error}
        aria-describedby={error ? "email-error" : undefined}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftSlot={<MailIcon />}
      />
      {error && <p id="email-error" className="text-danger text-xs">{error}</p>}
    </form>
  );
}`}
        />
      </Section>
    </ComponentPage>
  );
}
