"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Avatar } from "@/ds/primitives/Avatar";
import type { AvatarSize } from "@/ds/primitives/Avatar";

const sizes: AvatarSize[] = ["xs", "sm", "md", "lg", "xl"];
const names = ["김준하", "이서연", "박민수", "최유진", "정다은", "한승우", "오지현", "강태양"];

export default function AvatarPage() {
  return (
    <ComponentPage
      name="Avatar"
      description="사용자 프로필 표시. 이름 기반 이니셜과 자동 색상 할당을 지원합니다."
      importPath='import { Avatar } from "@/ds/primitives/Avatar"'
      props={[
        { name: "name", type: "string", description: "이름 (이니셜 자동 추출)" },
        { name: "src", type: "string", description: "이미지 URL" },
        { name: "size", type: '"xs"|"sm"|"md"|"lg"|"xl"', default: '"md"', description: "크기" },
        { name: "status", type: '"online"|"offline"|"away"|"busy"', description: "상태 표시" },
      ]}
    >
      <Section title="Sizes">
        <Preview>
          <div className="flex items-end gap-3">
            {sizes.map((s) => (
              <Avatar key={s} name="김준하" size={s} />
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="Auto Color">
        <Preview>
          <div className="flex items-center gap-2 flex-wrap">
            {names.map((n) => (
              <Avatar key={n} name={n} size="lg" />
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="Status">
        <Preview>
          <div className="flex items-center gap-4">
            <Avatar name="김준하" size="lg" status="online" />
            <Avatar name="이서연" size="lg" status="away" />
            <Avatar name="박민수" size="lg" status="busy" />
            <Avatar name="최유진" size="lg" status="offline" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
