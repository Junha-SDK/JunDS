"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { IconButton } from "@/ds/primitives/IconButton";

const PlusIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const CloseIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const MenuIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M2 4h12M2 8h12M2 12h12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default function IconButtonPage() {
  return (
    <ComponentPage
      name="IconButton"
      description="아이콘 전용 버튼. ghost, outline, filled 변형."
      importPath='import { IconButton } from "@/ds/primitives/IconButton"'
      props={[
        { name: "icon", type: "ReactNode", required: true, description: "아이콘" },
        { name: "label", type: "string", required: true, description: "접근성 라벨" },
        {
          name: "variant",
          type: '"ghost"|"outline"|"filled"',
          default: '"ghost"',
          description: "스타일",
        },
        { name: "size", type: '"xs"|"sm"|"md"|"lg"', default: '"md"', description: "크기" },
      ]}
    >
      <Section title="Variants & Sizes">
        <Preview>
          <div className="flex items-center gap-4">
            <IconButton icon={PlusIcon} label="추가" variant="ghost" />
            <IconButton icon={CloseIcon} label="닫기" variant="outline" />
            <IconButton icon={MenuIcon} label="메뉴" variant="filled" />
            <IconButton icon={PlusIcon} label="추가" size="xs" />
            <IconButton icon={PlusIcon} label="추가" size="lg" variant="outline" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
