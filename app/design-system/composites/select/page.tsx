"use client";
import { useState } from "react";
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
import { Select } from "@/ds/composites/Select";

const frameworkOptions = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "SolidJS" },
];

const countryOptions = [
  { value: "kr", label: "대한민국" },
  { value: "us", label: "미국" },
  { value: "jp", label: "일본" },
  { value: "cn", label: "중국" },
  { value: "gb", label: "영국" },
  { value: "de", label: "독일" },
  { value: "fr", label: "프랑스" },
];

const disabledOptions = [
  { value: "active", label: "활성 옵션" },
  { value: "disabled", label: "비활성 옵션", disabled: true },
  { value: "another", label: "다른 옵션" },
];

export default function SelectPage() {
  const [basic, setBasic] = useState("");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [sm, setSm] = useState("");
  const [md, setMd] = useState("");
  const [lg, setLg] = useState("");
  const [disabled, setDisabled] = useState("");
  const [error, setError] = useState("");
  const [preselected, setPreselected] = useState("react");

  return (
    <ComponentPage
      name="Select"
      description="사용자가 미리 정의된 옵션 목록에서 하나의 값을 선택할 수 있는 드롭다운 컴포넌트입니다. 검색 기능과 키보드 내비게이션을 지원하여 많은 옵션 중에서도 빠르게 원하는 항목을 찾을 수 있습니다."
      importPath='import { Select } from "@/ds/composites/Select"'
      status="stable"
      version="1.0.0"
      props={[
        { name: "options", type: "SelectOption<T>[]", required: true, description: "드롭다운에 표시할 옵션 목록. 각 옵션은 value, label, icon?, disabled? 속성을 가집니다." },
        { name: "value", type: "string", description: "현재 선택된 값. 제어 컴포넌트로 사용할 때 필요합니다." },
        { name: "onChange", type: "(value: T) => void", description: "옵션 선택 시 호출되는 콜백 함수" },
        { name: "placeholder", type: "string", default: '"선택하세요"', description: "값이 선택되지 않았을 때 표시되는 안내 텍스트" },
        { name: "disabled", type: "boolean", default: "false", description: "셀렉트 비활성화 여부" },
        { name: "error", type: "boolean", default: "false", description: "에러 상태 표시 여부" },
        { name: "searchable", type: "boolean", default: "false", description: "드롭다운 내 검색 입력 필드 활성화" },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "셀렉트 트리거의 크기" },
        { name: "fullWidth", type: "boolean", default: "false", description: "부모 컨테이너 너비에 맞춤" },
        { name: "className", type: "string", description: "트리거 요소에 추가할 커스텀 클래스" },
      ]}
      related={[
        { name: "MultiSelect", href: "/design-system/composites/multi-select" },
        { name: "Combobox", href: "/design-system/composites/combobox" },
        { name: "AutoComplete", href: "/design-system/composites/auto-complete" },
      ]}
    >
      {/* ── 개요 ── */}
      <Section title="개요" description="기본 Select는 클릭 시 드롭다운이 열리며, 옵션 중 하나를 선택할 수 있습니다.">
        <Preview>
          <div className="flex flex-col gap-4 max-w-xs w-full">
            <Select
              options={frameworkOptions}
              value={basic}
              onChange={setBasic}
              placeholder="프레임워크를 선택하세요"
              fullWidth
            />
          </div>
        </Preview>
        <CodeExample
          code={`const [value, setValue] = useState("");

<Select
  options={[
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
  ]}
  value={value}
  onChange={setValue}
  placeholder="프레임워크를 선택하세요"
/>`}
        />
      </Section>

      {/* ── 구조 ── */}
      <Section title="구조 (Anatomy)">
        <Anatomy
          items={[
            { label: "Trigger", description: "클릭하면 드롭다운을 열고 닫는 버튼 영역입니다. 선택된 값 또는 placeholder를 표시합니다." },
            { label: "Dropdown", description: "옵션 목록을 감싸는 드롭다운 패널입니다. Trigger 아래에 나타납니다." },
            { label: "Option", description: "개별 선택 가능한 항목입니다. 텍스트, 아이콘을 포함할 수 있으며 disabled 상태를 가질 수 있습니다." },
            { label: "Placeholder", description: "값이 선택되지 않았을 때 Trigger 내부에 표시되는 안내 텍스트입니다." },
          ]}
        />
      </Section>

      {/* ── 검색 가능 ── */}
      <Section title="검색 가능 Select" description="searchable 옵션을 활성화하면 드롭다운 상단에 검색 입력 필드가 나타나 옵션을 필터링할 수 있습니다. 옵션이 많을 때 유용합니다.">
        <Preview>
          <div className="max-w-xs w-full">
            <Select
              options={countryOptions}
              value={country}
              onChange={setCountry}
              searchable
              placeholder="국가를 검색하세요"
              fullWidth
            />
          </div>
        </Preview>
        <UsageNote type="tip">
          옵션이 7개 이상일 때 <code className="text-xs font-mono bg-gray-100 px-1 rounded">searchable</code>을 활성화하면 사용자 경험이 크게 향상됩니다.
        </UsageNote>
      </Section>

      {/* ── 크기 ── */}
      <Section title="크기 (Sizes)" description="sm, md, lg 세 가지 크기를 제공합니다. 주변 UI 요소와 조화를 이루도록 적절한 크기를 선택하세요.">
        <VariantGrid cols={3}>
          <VariantItem label="Small" description="좁은 공간, 테이블 내부 등에 적합">
            <Select options={frameworkOptions} value={sm} onChange={setSm} size="sm" placeholder="Small" />
          </VariantItem>
          <VariantItem label="Medium" description="기본 크기. 대부분의 폼에서 사용">
            <Select options={frameworkOptions} value={md} onChange={setMd} size="md" placeholder="Medium" />
          </VariantItem>
          <VariantItem label="Large" description="강조가 필요한 주요 입력 필드에 적합">
            <Select options={frameworkOptions} value={lg} onChange={setLg} size="lg" placeholder="Large" />
          </VariantItem>
        </VariantGrid>
      </Section>

      {/* ── 상태 ── */}
      <Section title="상태 (States)" description="Select는 기본, 선택됨, 비활성, 에러 등 다양한 상태를 가질 수 있습니다.">
        <VariantGrid cols={2}>
          <VariantItem label="기본 상태" description="값이 선택되지 않은 초기 상태">
            <div className="w-full max-w-[200px]">
              <Select options={frameworkOptions} value="" onChange={() => {}} placeholder="선택하세요" fullWidth />
            </div>
          </VariantItem>
          <VariantItem label="선택된 상태" description="사용자가 값을 선택한 상태">
            <div className="w-full max-w-[200px]">
              <Select options={frameworkOptions} value={preselected} onChange={setPreselected} fullWidth />
            </div>
          </VariantItem>
          <VariantItem label="비활성 상태" description="사용자 상호작용이 차단된 상태">
            <div className="w-full max-w-[200px]">
              <Select options={frameworkOptions} value={disabled} onChange={setDisabled} disabled placeholder="비활성화됨" fullWidth />
            </div>
          </VariantItem>
          <VariantItem label="에러 상태" description="유효성 검증에 실패한 상태">
            <div className="w-full max-w-[200px]">
              <Select options={frameworkOptions} value={error} onChange={setError} error placeholder="필수 항목" fullWidth />
            </div>
          </VariantItem>
        </VariantGrid>
      </Section>

      {/* ── 비활성 옵션 ── */}
      <Section title="개별 옵션 비활성화" description="각 옵션에 disabled 속성을 추가하여 특정 옵션만 선택 불가능하게 만들 수 있습니다.">
        <Preview>
          <div className="max-w-xs w-full">
            <Select
              options={disabledOptions}
              value=""
              onChange={() => {}}
              placeholder="옵션 선택"
              fullWidth
            />
          </div>
        </Preview>
      </Section>

      {/* ── 가이드라인 ── */}
      <Section title="가이드라인">
        <Guidelines
          items={[
            {
              type: "do",
              description: "옵션이 5개 이상이면 searchable 기능을 추가하여 빠른 탐색을 지원하세요.",
            },
            {
              type: "dont",
              description: "옵션이 3개 이하라면 Select 대신 Radio 또는 SegmentedControl 사용을 권장합니다.",
            },
            {
              type: "do",
              description: "placeholder 텍스트로 어떤 값을 선택해야 하는지 명확하게 안내하세요. (예: '국가를 선택하세요')",
            },
            {
              type: "dont",
              description: "옵션 라벨에 지나치게 긴 텍스트를 사용하지 마세요. 트리거 영역을 초과하면 사용성이 떨어집니다.",
            },
            {
              type: "caution",
              description: "폼 내에서 필수 선택인 경우 error 상태와 함께 적절한 에러 메시지를 표시하세요.",
            },
            {
              type: "do",
              description: "관련된 옵션끼리 논리적 순서로 정렬하세요. 알파벳순, 빈도순 등 사용 맥락에 맞는 정렬 기준을 적용합니다.",
            },
          ]}
        />
      </Section>

      {/* ── 접근성 ── */}
      <Section title="접근성">
        <AccessibilityNote
          items={[
            "드롭다운은 role=\"listbox\"를, 각 옵션은 role=\"option\"을 사용합니다.",
            "키보드 내비게이션: 위/아래 화살표로 옵션 이동, Enter로 선택, Escape로 닫기를 지원합니다.",
            "열린 상태에서 aria-expanded=\"true\"가 트리거에 설정됩니다.",
            "선택된 옵션에 aria-selected=\"true\"가 적용됩니다.",
            "searchable 모드에서는 드롭다운이 열릴 때 검색 입력 필드에 자동으로 포커스가 이동합니다.",
            "외부 클릭 또는 Escape 키로 드롭다운을 닫을 수 있습니다.",
          ]}
        />
      </Section>

      {/* ── 사용 예시 코드 ── */}
      <Section title="사용 예시">
        <CodeExample
          code={`// 기본 사용
const [value, setValue] = useState("");

<Select
  options={options}
  value={value}
  onChange={setValue}
  placeholder="선택하세요"
/>

// 검색 가능 + 전체 너비
<Select
  options={countryOptions}
  value={country}
  onChange={setCountry}
  searchable
  fullWidth
  placeholder="국가를 검색하세요"
/>

// 에러 상태
<Select
  options={options}
  value={value}
  onChange={setValue}
  error
  placeholder="필수 항목입니다"
/>`}
        />
      </Section>
    </ComponentPage>
  );
}
